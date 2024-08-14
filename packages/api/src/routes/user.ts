import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";
import { getTableColumns } from "drizzle-orm";
import * as v from "valibot";

const insertUserSchema = v.object({
	username: v.pipe(v.string(), v.minLength(3)),
	email: v.pipe(v.string(), v.email()),
	bio: v.optional(v.pipe(v.string(), v.maxLength(255))),
});

const selectUserSchema = v.object({
	username: v.pipe(v.string(), v.minLength(3)),
});

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		try {
			const { id, authId, createdAt, updatedAt, ...rest } = getTableColumns(users);
			const user = await ctx.db.select(rest).from(users).where(eq(users.authId, ctx.user.id)).limit(1);
			return user.length > 0 ? user[0] : null;
		} catch (error) {
			return { status: 503, message: "An unexpected error occurred" };
		}
	}),

	getUserByUsername: protectedProcedure
		.input((raw) => v.parse(selectUserSchema, raw))
		.query(async ({ ctx, input }) => {
			try {
				const { id, authId, createdAt, updatedAt, email, ...rest } = getTableColumns(users);
				const user = await ctx.db.select(rest).from(users).where(eq(users.username, input.username)).limit(1);
				return user.length > 0 ? user[0] : null;
			} catch (error) {
				return { status: 503, message: "An unexpected error occurred" };
			}
		}),

	createNewUser: protectedProcedure
		.input((raw) => v.parse(insertUserSchema, raw))
		.mutation(async ({ ctx, input }) => {
			try {
				const exists =
					(await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1)).length > 0;
				if (exists) {
					return {
						status: 400,
						message: "Username already in use.",
					};
				}

				const data = {
					username: input.username,
					email: input.email,
					authId: ctx.user.id,
					bio: input.bio,
				};

				const user = await ctx.db.insert(users).values(data).returning();
				return user[0];
			} catch (error) {
				return {
					status: 503,
					message: "An unexpected error occurred",
				};
			}
		}),
});
