import { eq } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { chambers, posts, users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";
import { slugify } from "../utils/slugify";

const selectPostsInChamber = v.object({
	chamberName: v.string(),
});

const selectPostSchema = v.object({
	slug: v.pipe(v.string(), v.trim(), v.minLength(3), v.toLowerCase()),
});

const insertPostSchema = v.object({
	chamberName: v.pipe(v.string(), v.trim(), v.minLength(3), v.toLowerCase()),
	title: v.pipe(v.string(), v.trim(), v.minLength(3), v.maxLength(255)),
	content: v.pipe(v.string(), v.trim(), v.minLength(3)),
});

export const postRouter = router({
	getPost: protectedProcedure
		.input((raw) => v.parse(selectPostSchema, raw))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db
				.select({
					title: posts.title,
					content: posts.content,
					author: users.username,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
				})
				.from(posts)
				.leftJoin(users, eq(posts.authorId, users.id))
				.where(eq(posts.slug, input.slug))
				.limit(1);

			throwTRPCErrorOnCondition(post.length === 0, "NOT_FOUND", "Post");

			return post[0];
		}),

	getPostsInChamber: protectedProcedure
		.input((raw) => v.parse(selectPostsInChamber, raw))
		.query(async ({ ctx, input }) => {
			const chamber = await ctx.db
				.select({ name: chambers.name })
				.from(chambers)
				.where(eq(chambers.name, input.chamberName))
				.limit(1);

			throwTRPCErrorOnCondition(chamber.length === 0, "NOT_FOUND", "Chamber");

			const chamberPosts = await ctx.db
				.select({
					username: users.username,
					postId: posts.id,
					title: posts.title,
					content: posts.content,
					slug: posts.slug,
				})
				.from(posts)
				.leftJoin(users, eq(posts.authorId, users.id))
				.where(eq(posts.chamberName, chamber[0].name));

			return chamberPosts;
		}),

	createPostInChamber: protectedProcedure
		.input((raw) => v.parse(insertPostSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const chamber = await ctx.db
				.select({ name: chambers.name })
				.from(chambers)
				.where(eq(chambers.name, input.chamberName))
				.limit(1);

			throwTRPCErrorOnCondition(chamber.length === 0, "NOT_FOUND", "Chamber");

			const user = await ctx.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authId, ctx.user.id))
				.limit(1);

			const slug = slugify(input.title);

			const insertData = { ...input, chamberName: chamber[0].name, slug, authorId: user[0].id };
			const data = await ctx.db.insert(posts).values(insertData).returning();
			return data[0];
		}),
});
