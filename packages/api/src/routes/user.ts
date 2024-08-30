import { eq } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const updateUserSchema = v.object({
	username: v.optional(v.pipe(v.string(), v.trim(), v.minLength(3))),
	bio: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))),
	profilePictureUrl: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(255))),
});

const selectUserSchema = v.object({
	username: v.pipe(v.string(), v.trim(), v.minLength(3)),
});

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),

	getUserByUsername: protectedProcedure
		.input((raw) => v.parse(selectUserSchema, raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db
				.select({
					username: users.username,
					displayName: users.displayName,
					bio: users.bio,
					profilePictureUrl: users.profilePictureUrl,
					follows: users.follows,
					followedBy: users.followedBy,
					createdAt: users.createdAt,
				})
				.from(users)
				.where(eq(users.username, input.username))
				.limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");
			return user[0];
		}),

	updateUser: protectedProcedure
		.input((raw) => v.parse(updateUserSchema, raw))
		.mutation(async ({ ctx, input }) => {
			// TODO: Handle profile picture uploading / deleting
			// TODO: Make sure error is not thrown if user is trying to update their own profile.
			const usernameExists = input.username
				? await ctx.db.select({}).from(users).where(eq(users.username, input.username)).limit(1)
				: [];
			throwTRPCErrorOnCondition(usernameExists.length > 0, "CONFLICT", "Username");

			const updatedUser = await ctx.db.update(users).set(input).where(eq(users.id, ctx.user.id)).returning({
				username: users.username,
				bio: users.bio,
				profilePictureUrl: users.profilePictureUrl,
			});

			return updatedUser[0];
		}),
});
