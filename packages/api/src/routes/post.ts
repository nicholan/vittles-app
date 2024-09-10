import * as crypto from "node:crypto";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import { imageDimensionsFromData } from "image-dimensions";
import * as v from "valibot";
import type { ApiContextProps } from "../context";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { favorites, follows, images, posts, reblogs, users } from "../db/schema";
import type { Images } from "../db/schema";
import { protectedProcedure, router } from "../trpc";
import { streamToBuffer } from "../utils/streamToBuffer";
import { getInteractionsAndMedia } from "../db/queries";
import { handleFileUpload } from "./file";

export type ImageDetails = Images;

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

const selectPostSchema = v.object({
	postId: v.number(),
});

const insertPostSchema = v.pipe(
	v.object({
		rootPostId: v.union([v.number(), v.null()]),
		replyToPostId: v.union([v.number(), v.null()]),
		content: v.union([v.string(), v.null()]),
		files: v.optional(v.array(v.object({ ext: v.string(), key: v.string() }))),
	}),
	v.forward(
		v.partialCheck(
			[["content"], ["files"]],
			(input) => {
				return !!input.content || !!input.files;
			},
			"Post cannot be empty.",
		),
		["content"],
	),
);

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
			const directReplies = await getPosts(ctx, sql`${posts.rootPostId} = ${input.postId}`);
			const directRepliesWithDepth = directReplies.map((reply) => ({
				...reply,
				depth: 1,
			}));

			// Fetch nested replies for each direct reply and set depth to 2
			const repliesWithNestedReplies = await Promise.all(
				directRepliesWithDepth.map(async (reply) => {
					const nestedReplies = await getPosts(ctx, sql`${posts.rootPostId} = ${reply.postId}`);
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
		const rootPosts = await getPosts(ctx, sql`${posts.rootPostId} IS NULL`);
		console.log(rootPosts);
		return rootPosts;
	}),

	getComments: protectedProcedure
		.input((raw) => v.parse(v.object({ postId: v.number() }), raw))
		.query(async ({ ctx, input }) => {
			const comments = await getPosts(ctx, sql`${posts.rootPostId} = ${input.postId}`);
			return comments;
		}),

	getPostsByUsername: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const userPosts = await getPosts(ctx, sql`${users.id} = ${user[0].id} AND ${posts.rootPostId} IS NULL`);
			return userPosts;
		}),

	getRepliesByUsername: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const userPosts = await getPosts(ctx, sql`${users.id} = ${user[0].id} AND ${posts.rootPostId} IS NOT NULL`);
			return userPosts;
		}),

	getMediaByUsername: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const userPosts = await getPosts(
				ctx,
				sql`${users.id} = ${user[0].id} AND ${sql`array_length(${posts.files}, 1)`} > 0 `,
			);
			return userPosts;
		}),

	getLikedPostsByUsername: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const userPosts = await getLikedPosts(ctx, sql`${favorites.userId} = ${user[0].id}`);
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
			const attachments = input.files ? await handleFileUpload(ctx, input.files) : [];

			const postData = {
				content: input.content,
				userId: ctx.user.id,
				rootPostId: input.rootPostId,
				replyToPostId: input.replyToPostId,
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
});

// Get user favorited posts. Can it be reused for reblogs?
async function getLikedPosts(ctx: ApiContextProps, where: SQL, limit = 20) {
	const q = await ctx.db
		.select({
			postId: posts.id,
			rootPostId: posts.rootPostId,
			replyToPostId: posts.replyToPostId,
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
		.from(favorites)
		.where(where)
		.innerJoin(posts, eq(favorites.postId, posts.id))
		.innerJoin(users, eq(posts.userId, users.id))
		.limit(limit);

	return await getInteractionsAndMedia(ctx, q);
}

async function getPosts(ctx: ApiContextProps, where: SQL, limit = 20) {
	const q = await ctx.db
		.select({
			postId: posts.id,
			rootPostId: posts.rootPostId,
			replyToPostId: posts.replyToPostId,
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

	return await getInteractionsAndMedia(ctx, q);
}
