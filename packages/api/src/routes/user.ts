import { eq } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { users } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const insertUserSchema = v.object({
	username: v.pipe(v.string(), v.trim(), v.minLength(3)),
	email: v.pipe(v.string(), v.email()),
	bio: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(255))),
	profilePictureUrl: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(255))),
});

const updateUserSchema = v.object({
	bio: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))),
	profilePictureUrl: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(255))),
});

const selectUserSchema = v.object({
	username: v.pipe(v.string(), v.trim(), v.minLength(3)),
});

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db
			.select({
				username: users.username,
				bio: users.bio,
				profilePictureUrl: users.profilePictureUrl,
				email: users.email,
			})
			.from(users)
			.where(eq(users.authId, ctx.user.id))
			.limit(1);

		throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");
		return user[0];
	}),

	getUserByUsername: protectedProcedure
		.input((raw) => v.parse(selectUserSchema, raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db
				.select({ username: users.username, bio: users.bio, profilePictureUrl: users.profilePictureUrl })
				.from(users)
				.where(eq(users.username, input.username))
				.limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");
			return user[0];
		}),

	createNewUser: protectedProcedure
		.input((raw) => v.parse(insertUserSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const existingUser = await ctx.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.username, input.username))
				.limit(1);

			throwTRPCErrorOnCondition(existingUser.length > 0, "CONFLICT", "Username");

			// TODO: Handle profile picture uploading
			const data = {
				username: input.username,
				email: input.email,
				authId: ctx.user.id,
				bio: input.bio,
				profilePictureUrl: input.profilePictureUrl,
			};

			const user = await ctx.db.insert(users).values(data).returning({
				username: users.username,
				bio: users.bio,
				profilePictureUrl: users.profilePictureUrl,
				email: users.email,
			});
			return user[0];
		}),

	updateUser: protectedProcedure
		.input((raw) => v.parse(updateUserSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authId, ctx.user.id))
				.limit(1);

			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			// TODO: Handle profile picture uploading / deleting
			const data = {
				bio: input.bio,
				profilePictureUrl: input.profilePictureUrl,
			};

			const updatedUser = await ctx.db.update(users).set(data).where(eq(users.id, user[0].id)).returning({
				username: users.username,
				bio: users.bio,
				profilePictureUrl: users.profilePictureUrl,
				email: users.email,
			});
			return updatedUser[0];
		}),
});
