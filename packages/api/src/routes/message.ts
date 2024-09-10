import { eq, sql, count, desc, asc, and, isNull, inArray } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { users, threads, messages, usersToThreads, messageReads } from "../db/schema";
import { protectedProcedure, router } from "../trpc";
import type { ApiContextProps } from "../context";
import { handleFileUpload } from "./file";
import type { FileUploadProps } from "./file";

const insertMessageSchema = v.pipe(
	v.object({
		threadId: v.optional(v.number()),
		replyToMessageId: v.optional(v.number()),
		recipientUsername: v.optional(v.string()),
		content: v.optional(v.string()),
		files: v.optional(v.array(v.object({ ext: v.string(), key: v.string() }))),
	}),
	v.forward(
		v.partialCheck(
			[["content"], ["files"]],
			(input) => {
				return !!input.content || !!input.files;
			},
			"Message cannot be empty.",
		),
		["content"],
	),
);

export const messageRouter = router({
	// Get total number of unread messages for active and unmuted threads.
	getUnreadMessagesCount: protectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.db
			.select({
				totalUnreadCount: count(messages.id),
			})
			.from(usersToThreads)
			.innerJoin(threads, eq(usersToThreads.threadId, threads.id))
			.leftJoin(messages, eq(messages.threadId, threads.id))
			.leftJoin(
				messageReads,
				and(
					eq(messageReads.messageId, messages.id),
					eq(messageReads.userId, ctx.user.id), // Check if the message was read by the user
				),
			)
			.where(
				and(
					eq(usersToThreads.userId, ctx.user.id), // User is part of the thread
					eq(usersToThreads.active, true), // The thread is active for the user
					eq(usersToThreads.muted, false), // The thread is not muted
					isNull(messageReads.id), // The message is unread (i.e., no read record for the user)
				),
			);

		return {
			unreadMessagesCount: result.length > 0 ? result[0].totalUnreadCount : 0,
		};
	}),

	getMessageThreads: protectedProcedure.query(async ({ ctx }) => {
		const results = await ctx.db
			.select({
				threadId: threads.id,
				threadName: threads.threadName, // Thread name or username.
				threadPictureUrl: threads.threadPictureUrl, // Thread avatar or profile picture.
				isGroup: threads.isGroup,
				isPinned: usersToThreads.pinned,
				isMuted: usersToThreads.muted, // Is the thread muted
				unreadCount: count(messages.id), // Unread messages count for the thread.
				latestMessage: messages.content,
				latestMessageAt: messages.createdAt,
			})
			.from(usersToThreads)
			.innerJoin(threads, eq(usersToThreads.threadId, threads.id))
			.leftJoin(messages, eq(messages.threadId, threads.id))
			.leftJoin(messageReads, and(eq(messageReads.messageId, messages.id), eq(messageReads.userId, ctx.user.id)))
			.where(
				and(eq(usersToThreads.userId, ctx.user.id), eq(usersToThreads.active, true), isNull(messageReads.id)),
			) // Get only threads where user is a participant.
			.groupBy(threads.id, messages.id)
			.orderBy(desc(messages.createdAt))
			.limit(20);

		const threadIds = results.map((thread) => thread.threadId);

		// Get participants for each thread.
		const participantsByThread = await ctx.db
			.select({
				threadId: usersToThreads.threadId,
				user: users,
			})
			.from(usersToThreads)
			.innerJoin(users, eq(users.id, usersToThreads.userId))
			.where(
				and(
					eq(usersToThreads.active, true),
					inArray(usersToThreads.threadId, threadIds), // Filter by the thread IDs from userThreads
				),
			);

		// Map threads with either group title/picture or participant name/picture.
		const threadsWithParticipants = results.map((thread) => {
			if (thread.isGroup) return thread;
			const otherParticipant = participantsByThread.find((thread) => thread.user.id !== ctx.user.id);
			return {
				...thread,
				threadName: otherParticipant?.user.displayName ?? thread.threadName,
				threadPictureUrl: otherParticipant?.user.profilePictureUrl ?? thread.threadPictureUrl,
			};
		});

		return threadsWithParticipants;
	}),

	sendMessage: protectedProcedure
		.input((raw) => v.parse(insertMessageSchema, raw))
		.mutation(async ({ ctx, input }) => {
			// Scenario 1: Find group or direct message thread with provided threadId.
			if (input.threadId) {
				const query = await ctx.db
					.select()
					.from(usersToThreads)
					.where(eq(usersToThreads.threadId, input.threadId));

				const user = query.filter((participants) => participants.userId === ctx.user.id); // Is user part of the thread?
				throwTRPCErrorOnCondition(user.length === 0 || user[0].active === false, "NOT_FOUND", "Chat");

				const result = await sendChatMessage(ctx, { ...input, threadId: input.threadId });
				return result;
			}

			// Scenario 2: Find direct message thread with recipient username.
			// User is sending direct message to another user.
			if (input.recipientUsername) {
				// Find recipient
				const recipient = await ctx.db
					.select({
						id: users.id,
					})
					.from(users)
					.where(eq(users.username, input.recipientUsername));
				throwTRPCErrorOnCondition(recipient.length === 0, "NOT_FOUND", "User");

				// Fetch all thread IDs the current user is part of.
				const userThreadIds = await ctx.db
					.select({ threadId: usersToThreads.threadId })
					.from(usersToThreads)
					.where(eq(usersToThreads.userId, ctx.user.id));

				const threadIds = userThreadIds.map((thread) => thread.threadId);

				// Check if the recipient is in any of the same threads, and if those threads are direct message threads (not groups).
				const existingDirectThread = await ctx.db
					.select({ threadId: threads.id })
					.from(usersToThreads)
					.innerJoin(threads, eq(usersToThreads.threadId, threads.id))
					.where(
						and(
							eq(usersToThreads.userId, recipient[0].id), // Recipient is in the thread
							inArray(usersToThreads.threadId, threadIds), // Check if the thread is one the user is in
							eq(threads.isGroup, false), // Exclude group chats
						),
					)
					.limit(1);

				if (existingDirectThread.length > 0) {
					// Existing message thread found.
					const result = await sendChatMessage(ctx, { ...input, threadId: existingDirectThread[0].threadId });
					return result;
				}

				// No thread found, create a new direct message thread.
				const threadId = await createMessageThread(ctx, {
					participantIds: [recipient[0].id, ctx.user.id],
				});

				const result = await sendChatMessage(ctx, { ...input, threadId });
				return result;
			}

			throwTRPCErrorOnCondition(true, "BAD_REQUEST", "Thread", "Failed to send message.");
		}),

	createGroupChat: protectedProcedure
		.input((raw) =>
			v.parse(
				v.object({
					title: v.string(),
					pictureUrl: v.string(),
					participants: v.array(v.string()),
				}),
				raw,
			),
		)
		.mutation(async ({ ctx, input }) => {
			// Fetch participant IDs by their usernames
			const participants = await ctx.db
				.select({
					id: users.id,
					username: users.username,
				})
				.from(users)
				.where(inArray(users.username, input.participants));

			throwTRPCErrorOnCondition(
				participants.length !== input.participants.length,
				"BAD_REQUEST",
				"User",
				"One or more users were not found",
			);

			const participantIds = participants.map((p) => p.id);
			const thread = await createMessageThread(ctx, {
				...input,
				participantIds: participantIds,
				isGroup: true,
			});
		}),
});

type MessageProps = {
	threadId: number;
	replyToMessageId?: number;
	content?: string;
	files?: FileUploadProps[];
};

async function sendChatMessage(ctx: ApiContextProps, input: MessageProps) {
	if (ctx.user === null) {
		return throwTRPCErrorOnCondition(ctx.user === null, "UNAUTHORIZED", "User", "User is not logged in.");
	}

	const { threadId } = input;
	const attachments = input.files ? await handleFileUpload(ctx, input.files) : [];

	const message = await ctx.db
		.insert(messages)
		.values({
			...input,
			threadId,
			files: attachments.map((file) => file.id),
			senderId: ctx.user.id,
		})
		.returning();
	return message;
}

type ThreadProps = {
	participantIds: string[];
	isGroup?: boolean;
	threadName?: string;
	threadPictureUrl?: string;
};

async function createMessageThread(ctx: ApiContextProps, input: ThreadProps) {
	const { participantIds, isGroup, ...rest } = input;
	const thread = await ctx.db.insert(threads).values({ isGroup }).returning();
	const threadId = thread[0].id;

	const participantsToInsert = participantIds.map((participant) => ({
		userId: participant,
		threadId,
		role: isGroup && ctx.user && participant === ctx.user.id ? "admin" : "user",
	}));

	await ctx.db.insert(usersToThreads).values(participantsToInsert);
	return threadId;
}
