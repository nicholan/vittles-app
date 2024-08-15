import { eq, sql } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { comments, posts, users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const selectCommentSchema = v.object({
	postId: v.number(),
	parentCommentId: v.optional(v.number()),
});

const insertCommentSchema = v.object({
	postId: v.number(),
	parentCommentId: v.optional(v.number()),
	content: v.pipe(v.string(), v.trim(), v.minLength(3)),
});

export const commentRouter = router({
	getRootCommentsInPost: protectedProcedure
		.input((raw) => v.parse(selectCommentSchema, raw))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db.select({ id: posts.id }).from(posts).where(eq(posts.id, input.postId)).limit(1);
			throwTRPCErrorOnCondition(post.length === 0, "NOT_FOUND", "Post");

			const rootComments = await ctx.db.select().from(comments).where(getRootComments(post[0].id));
			return rootComments;
		}),

	createNewComment: protectedProcedure
		.input((raw) => v.parse(insertCommentSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const post = await ctx.db.select({ id: posts.id }).from(posts).where(eq(posts.id, input.postId)).limit(1);
			throwTRPCErrorOnCondition(post.length === 0, "NOT_FOUND", "Post");

			const user = await ctx.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authId, ctx.user.id))
				.limit(1);

			const insertData = { ...input, authorId: user[0].id, postId: post[0].id };
			const newComment = await ctx.db.insert(comments).values(insertData).returning();
			return newComment[0];
		}),
});

function getRootComments(postId: number) {
	return sql`${comments.postId} = ${postId} and ${comments.parentCommentId} = null`;
}
