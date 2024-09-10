import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	username: varchar("username", { length: 15 }).unique().notNull(),
	displayName: varchar("display_name", { length: 50 }).notNull(),
	bio: varchar("bio", { length: 255 }),
	follows: integer("follows").notNull().default(0),
	followedBy: integer("followed_by").notNull().default(0),
	profilePictureUrl: text("profile_picture_url"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
	notifications: many(notifications),
}));

export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: text("content"),
	files: uuid("files").array().notNull().default(sql`ARRAY[]::uuid[]`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	rootPostId: integer("root_post_id"),
	replyToPostId: integer("reply_to_post_id"),
	favorited: integer("favorited").notNull().default(0),
	reposted: integer("reposted").notNull().default(0),
	viewed: integer("viewed").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const postsRelations = relations(posts, ({ one }) => ({
	rootPost: one(posts, {
		fields: [posts.rootPostId],
		references: [posts.id],
	}),
	replyToPost: one(posts, {
		fields: [posts.replyToPostId],
		references: [posts.id],
	}),
}));

export const images = pgTable("images", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	url: text("url").notNull(),
	key: text("key").notNull(),
	extension: text("extension").notNull(),
	mime: text("mime").notNull(),
	width: integer("width").notNull(),
	height: integer("height").notNull(),
	size: integer("size").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const reblogs = pgTable("reblogs", {
	id: serial("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const favorites = pgTable("favorites", {
	id: serial("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	notifiedId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	notifierId: uuid("notifier_id")
		.notNull()
		.references(() => users.id),
	type: text("type").notNull(), // like, reblog, follow, mention, reply, quote, bookmark ...
	read: boolean("read").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const messages = pgTable("messages", {
	id: serial("id").primaryKey(),
	senderId: uuid("sender_id")
		.notNull()
		.references(() => users.id),
	threadId: integer("thread_id")
		.notNull()
		.references(() => threads.id),
	replyToMessageId: integer("reply_to_message_id"),
	deleted: boolean("deleted").notNull().default(false),
	content: text("content"),
	files: uuid("files").array().notNull().default(sql`ARRAY[]::uuid[]`),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const messageReads = pgTable("message_reads", {
	id: serial("id").primaryKey(),
	messageId: uuid("message_id")
		.notNull()
		.references(() => messages.id),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	readAt: timestamp("read_at").notNull().defaultNow(),
});

export const messageRelations = relations(messages, ({ one }) => ({
	replyToMessage: one(messages, {
		fields: [messages.replyToMessageId],
		references: [messages.id],
	}),
}));

export const threads = pgTable("threads", {
	id: serial("id").primaryKey(),
	isGroup: boolean("is_group").notNull().default(false),
	threadName: text("thread_name").default("Group chat"), // Thread name or username.
	threadPictureUrl: text("thread_avatar"), // Thread avatar or profile picture.
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const usersToThreads = pgTable("users_to_threads", {
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	threadId: integer("thread_id")
		.notNull()
		.references(() => threads.id),
	active: boolean("active").notNull().default(true),
	muted: boolean("muted").notNull().default(false),
	pinned: boolean("pinned").notNull().default(false),
	role: text("role").notNull().default("user"), // moderator, admin, user
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const threadRelations = relations(threads, ({ many }) => ({
	messages: many(messages),
	users: many(users),
}));

export const follows = pgTable("follows", {
	id: serial("id").primaryKey(),
	followedId: uuid("followed_id")
		.notNull()
		.references(() => users.id),
	followerId: uuid("follower_id")
		.notNull()
		.references(() => users.id),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

// TODO Versions >= 0.31 of Valibot breaks drizzle-valibot schema inferring.
// Reverting to 0.30 fixes this, but without valibot pipe() function.

// https://github.com/drizzle-team/drizzle-orm/issues/2521

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
// export const insertUserSchema = createInsertSchema(users);
// export const selectUserSchema = createSelectSchema(users);

export type Post = InferSelectModel<typeof posts>;
export type InserPost = InferInsertModel<typeof posts>;
// export const insertPostchema = createInsertSchema(posts);
// export const selectPostSchema = createSelectSchema(posts);

export type Images = InferSelectModel<typeof images>;
export type Messages = InferSelectModel<typeof messages>;
export type UsersToThreads = InferSelectModel<typeof usersToThreads>;
