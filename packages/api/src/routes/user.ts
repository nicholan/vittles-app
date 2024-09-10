import { eq, sql } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { users, follows } from "../db/schema";
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

	getFollows: protectedProcedure
		.input((raw) => v.parse(v.object({ username: v.string() }), raw))
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);
			throwTRPCErrorOnCondition(user.length === 0, "NOT_FOUND", "User");

			const followData = await ctx.db
				.select({
					followType: sql<string>`'follower'`.as("type"), // Identify this as a follower entry
					userId: follows.followerId, // Users who follow the current user
					username: users.username,
					displayName: users.displayName,
					profilePictureUrl: users.profilePictureUrl,
					follows: users.follows,
					followedBy: users.followedBy,
					bio: users.bio,
				})
				.from(follows)
				.leftJoin(users, eq(follows.followerId, users.id)) // Join to get follower details
				.where(eq(follows.followedId, ctx.user.id)) // Filter for people who follow the current user
				.unionAll(
					ctx.db
						.select({
							followType: sql<string>`'following'`.as("type"), // Identify this as a following entry
							userId: follows.followedId, // Users the current user is following
							username: users.username,
							displayName: users.displayName,
							profilePictureUrl: users.profilePictureUrl,
							follows: users.follows,
							followedBy: users.followedBy,
							bio: users.bio,
						})
						.from(follows)
						.leftJoin(users, eq(follows.followedId, users.id)) // Join to get followed user details
						.where(eq(follows.followerId, ctx.user.id)), // Filter for people the user is following
				)
				.limit(50);

			const followers = followData.filter((f) => f.followType === "follower");
			const following = followData.filter((f) => f.followType === "following");

			// Return the user info and separated follower/following data
			return {
				user: user[0], // User's details
				followers, // Followers array
				following, // Following array
			};
		}),
});
