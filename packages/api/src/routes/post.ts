import * as crypto from "node:crypto";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { count, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import { imageDimensionsFromData } from "image-dimensions";
import * as v from "valibot";
import type { ApiContextProps } from "../context";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { favorites, follows, images, posts, reblogs, users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";
import { streamToBuffer } from "../utils/streamToBuffer";

type Attachment = {
	id: string;
	url: string;
	key: string;
	extension: string;
	mime: string;
	width: number;
	height: number;
	size: number;
};

type PostWith = {
	postId: number;
	files: string[];
};

export type ImageDetails = Omit<Attachment, "extension">;

const selectPostSchema = v.object({
	postId: v.number(),
});

const insertPostSchema = v.pipe(
	v.object({
		parentPostId: v.union([v.number(), v.null()]),
		content: v.union([v.string(), v.null()]),
		files: v.optional(v.array(v.object({ ext: v.string(), key: v.string() }))),
	}),
	v.forward(
		v.partialCheck(
			[["content"], ["files"]],
			(input) => {
				return !!input.content || !!input.files;
			},
			"Post must contain either content or files.",
		),
		["content"],
	),
);

const filesSchema = v.object({
	count: v.pipe(v.number(), v.minValue(1), v.maxValue(4)),
});

export const postRouter = router({
	// Get a single post by id.
	getPost: protectedProcedure
		.input((raw) => v.parse(selectPostSchema, raw))
		.query(async ({ ctx, input }) => {
			const post = await getPosts(ctx, sql`${posts.id} = ${input.postId}`);
			throwTRPCErrorOnCondition(post.length === 0, "NOT_FOUND", "Post");

			return [{ ...post[0], replies: [], depth: 0 }];
		}),

	// Get a single post by id, with limit 10 direct replies and limit 3 nested replies.
	// TODO: Implement pagination.
	getPostWithDepth2: protectedProcedure
		.input((raw) => v.parse(selectPostSchema, raw))
		.query(async ({ ctx, input }) => {
			// Fetch the root post and set depth to 0
			const rootPost = await getPosts(ctx, sql`${posts.id} = ${input.postId}`);
			throwTRPCErrorOnCondition(rootPost.length === 0, "NOT_FOUND", "Post");

			// Fetch direct replies to the root post with depth set to 1
			const directReplies = await getPosts(ctx, sql`${posts.parentPostId} = ${input.postId}`);
			const directRepliesWithDepth = directReplies.map((reply) => ({
				...reply,
				depth: 1,
			}));

			// Fetch nested replies for each direct reply and set depth to 2
			const repliesWithNestedReplies = await Promise.all(
				directRepliesWithDepth.map(async (reply) => {
					const nestedReplies = await getPosts(ctx, sql`${posts.parentPostId} = ${reply.postId}`);
					const nestedRepliesWithDepth = nestedReplies.map((nestedReply) => ({
						...nestedReply,
						depth: 2,
					}));
					return { ...reply, replies: nestedRepliesWithDepth };
				}),
			);

			// Include nested replies in the final response and set root depth to 0
			const data = { ...rootPost[0], depth: 0, replies: repliesWithNestedReplies };

			return [data];
		}),

	getFeedPosts: protectedProcedure.query(async ({ ctx }) => {
		const rootPosts = await getPosts(ctx, sql`${posts.parentPostId} IS NULL`);
		console.log(rootPosts);
		return rootPosts;
	}),

	getComments: protectedProcedure
		.input((raw) => v.parse(v.object({ postId: v.number() }), raw))
		.query(async ({ ctx, input }) => {
			const comments = await getPosts(ctx, sql`${posts.parentPostId} = ${input.postId}`);
			return comments;
		}),

	getPostsByUsername: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const userPosts = await getPosts(ctx, sql`${users.id} = ${user[0].id}`);
			return userPosts;
		}),

	toggleFavorite: protectedProcedure
		.input((raw) => v.parse(v.object({ postId: v.number() }), raw))
		.mutation(async ({ ctx, input }) => {
			const existingFavorite = await ctx.db
				.select()
				.from(favorites)
				.where(sql`${favorites.userId} = ${ctx.user.id} AND ${favorites.postId} = ${input.postId}`);

			if (existingFavorite.length > 0) {
				await ctx.db.delete(favorites).where(eq(favorites.id, existingFavorite[0].id));
				const updatedPost = await ctx.db
					.update(posts)
					.set({ favorited: sql`${posts.favorited} - 1` })
					.where(eq(posts.id, input.postId))
					.returning();
				return updatedPost;
			}

			await ctx.db.insert(favorites).values({ userId: ctx.user.id, postId: input.postId }).returning();
			const updatedPost = await ctx.db
				.update(posts)
				.set({ favorited: sql`${posts.favorited} + 1` })
				.where(eq(posts.id, input.postId))
				.returning();
			return updatedPost;
		}),

	createPost: protectedProcedure
		.input((raw) => v.parse(insertPostSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const files = input.files;

			const { r2 } = ctx;
			const { R2_BUCKET_NAME } = ctx.env;
			const { R2_WEB_ENDPOINT } = ctx.env;

			const attachments: Attachment[] = [];

			if (files) {
				const allFileKeys = files.map((file) => file.key);

				try {
					for (const upload of files) {
						const uuid = crypto.randomUUID();
						const name = `${uuid}.${upload.ext}`;

						// Create a copy of the uploaded file.

						await r2.send(
							new CopyObjectCommand({
								Bucket: R2_BUCKET_NAME,
								CopySource: `${R2_BUCKET_NAME}/${upload.key}`,
								Key: name,
							}),
						);

						// Track the copied file key
						allFileKeys.push(name);

						// Delete the original file.
						r2.send(
							new DeleteObjectCommand({
								Bucket: R2_BUCKET_NAME,
								Key: upload.key,
							}),
						);

						// Get the copied file.
						const object = await r2.send(
							new GetObjectCommand({
								Bucket: R2_BUCKET_NAME,
								Key: name,
							}),
						);

						const buffer = await streamToBuffer(object.Body as ReadableStream);
						const [fileType, dimensions] = await Promise.all([
							fileTypeFromBuffer(buffer),
							imageDimensionsFromData(buffer),
						]);

						if (!fileType || !dimensions || upload.ext !== fileType.ext) {
							throw new Error("File type or dimensions are invalid.");
						}

						const { height, width } = dimensions;

						if (!object.ContentLength || [height, width].some((dim) => dim < 100 || dim > 5000)) {
							throw new Error("File size or dimensions are out of bounds.");
						}

						attachments.push({
							id: uuid,
							url: `${R2_WEB_ENDPOINT}/${name}`,
							key: name,
							extension: fileType.ext,
							mime: fileType.mime,
							width: dimensions.width,
							height: dimensions.height,
							size: object.ContentLength,
						});
					}
				} catch (error) {
					console.error(error);
					allFileKeys.map((key) => r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })));

					// Throw a TRPC error after cleaning up.
					throwTRPCErrorOnCondition(true, "BAD_REQUEST", "File", "Failed to upload file.");
				}
			}

			const postData = {
				content: input.content,
				userId: ctx.user.id,
				parentPostId: input.parentPostId,
				files: attachments.map((file) => file.id),
			};

			const createdPost = await ctx.db.insert(posts).values(postData).returning();

			if (attachments) {
				// Create entry for each image in the images table with postId and userId, return array of image ids.
				await Promise.all(
					attachments.map(async (file) =>
						ctx.db.insert(images).values({ ...file, postId: createdPost[0].id, userId: ctx.user.id }),
					),
				);
			}

			return { postId: createdPost[0].id, username: ctx.user.username };
		}),

	getPresignedUrls: protectedProcedure
		.input((raw) => v.parse(filesSchema, raw))
		.query(async ({ ctx, input }) => {
			const urls = [];
			try {
				for (let i = 0; i < input.count; i++) {
					const key = crypto.randomUUID() as string;

					const url = await getSignedUrl(
						ctx.r2,
						new PutObjectCommand({
							Bucket: ctx.env.R2_BUCKET_NAME,
							Key: key,
						}),
					);

					urls.push({ url, key });
				}

				return urls;
			} catch (e) {
				console.error(e);
			}
			return urls;
		}),
});

async function getPosts(ctx: ApiContextProps, where: SQL, limit = 20) {
	const q = await ctx.db
		.select({
			postId: posts.id,
			parentPostId: posts.parentPostId,
			content: posts.content,
			files: posts.files,
			follows: users.follows,
			followedBy: users.followedBy,
			bio: users.bio,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			username: users.username,
			displayName: users.displayName,
			profilePictureUrl: users.profilePictureUrl,
		})
		.from(posts)
		.leftJoin(users, eq(posts.userId, users.id))
		.where(where)
		.limit(limit);

	const engagements = await Promise.all(
		q.map(async (post) => {
			const [fc, cc, rc] = await Promise.all([
				ctx.db.select({ c: count() }).from(favorites).where(eq(favorites.postId, post.postId)),
				ctx.db.select({ c: count() }).from(posts).where(eq(posts.parentPostId, post.postId)),
				ctx.db.select({ c: count() }).from(reblogs).where(eq(reblogs.postId, post.postId)),
			]);

			return {
				...post,
				favoritesCount: fc[0].c,
				commentsCount: cc[0].c,
				reblogsCount: rc[0].c,
			};
		}),
	);

	return await withMedia(ctx, engagements);
}

async function withMedia<T extends PostWith>(
	ctx: ApiContextProps,
	posts: T[],
): Promise<(T & { files: ImageDetails[] })[]> {
	const mediaPromises = posts.map(async (post) => {
		if (!post.files) Promise.resolve(post);

		const populatedFiles = await ctx.db
			.select({
				id: images.id,
				url: images.url,
				width: images.width,
				height: images.height,
				mime: images.mime,
				size: images.size,
				key: images.key,
			})
			.from(images)
			.where(eq(images.postId, post.postId))
			.limit(post.files.length);

		return {
			...post,
			files: await signUrls(ctx, populatedFiles),
		};
	});

	return await Promise.all(mediaPromises);
}

async function signUrls(ctx: ApiContextProps, images: ImageDetails[]) {
	const signedMedia = await Promise.all(
		images.map(async (image) => {
			const url = await signGetUrl(ctx, image.key);
			return {
				...image,
				url,
			};
		}),
	);
	return signedMedia;
}

async function signGetUrl(ctx: ApiContextProps, key: string) {
	const command = new GetObjectCommand({
		Bucket: ctx.env.R2_BUCKET_NAME,
		Key: key,
	});

	return await getSignedUrl(ctx.r2, command, { expiresIn: 3600 });
}
