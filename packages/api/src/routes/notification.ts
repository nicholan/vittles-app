import { eq, sql, count, desc, asc } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { users, follows, messages, notifications } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const notificationTypes = v.union([
	v.literal("like"),
	v.literal("reblog"),
	v.literal("follow"),
	v.literal("mention"),
	v.literal("reply"),
	v.literal("quote"),
	v.literal("bookmark"),
]);

const notificationSchema = v.object({
	type: notificationTypes,
	postId: v.number(),
	username: v.string(),
});

export const notificationsRouter = router({
	getUnreadNotificationsCount: protectedProcedure.query(async ({ ctx }) => {
		const c = await ctx.db
			.select({ count: count() })
			.from(notifications)
			.where(sql`${notifications.notifiedId} = ${ctx.user.id} AND ${notifications.read} IS NOT TRUE`);

		return {
			notificationsCount: c.length > 0 ? c[0].count : 0,
		};
	}),

	// Maybe inner join on post? Or just link to postId?
	getNotifications: protectedProcedure.query(async ({ ctx }) => {
		const q = await ctx.db
			.select({
				postId: notifications.postId,
				username: users.username,
				displayName: users.displayName,
				bio: users.bio,
				profilePictureUrl: users.profilePictureUrl,
				follows: users.follows,
				followedBy: users.followedBy,
				type: notifications.type,
				read: notifications.read,
				createdAt: notifications.createdAt,
			})
			.from(notifications)
			.innerJoin(users, eq(notifications.notifierId, users.id))
			.where(eq(notifications.notifiedId, ctx.user.id))
			.orderBy(desc(notifications.createdAt))
			.limit(30);

		return q;
	}),

	updateNotifications: protectedProcedure.mutation(async ({ ctx }) => {
		const q = await ctx.db
			.update(notifications)
			.set({ read: true })
			.where(sql`${notifications.notifiedId} = ${ctx.user.id} AND ${notifications.read} IS NOT TRUE`);
	}),

	sendNotification: protectedProcedure
		.input((raw) => v.parse(notificationSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const notified = await ctx.db.select().from(users).where(eq(users.username, input.username)).limit(1);
			throwTRPCErrorOnCondition(notified.length === 0, "NOT_FOUND", "User");

			const notification = await ctx.db
				.insert(notifications)
				.values({
					notifierId: ctx.user.id,
					notifiedId: notified[0].id,
					postId: input.postId,
					type: input.type,
				})
				.returning();

			return notification[0];
		}),
});
