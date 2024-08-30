import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Users
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

// User can have many posts
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

// Posts
export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: text("content"),
	files: uuid("files").array().notNull().default(sql`ARRAY[]::uuid[]`),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	parentPostId: integer("parent_post_id"),
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
	parentPost: one(posts, {
		fields: [posts.parentPostId],
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
});

export const reblogs = pgTable("reblogs", {
	id: serial("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
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
	type: text("type").notNull(),
	read: boolean("read").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const follows = pgTable("follows", {
	id: serial("id").primaryKey(),
	followedId: uuid("followed_id")
		.notNull()
		.references(() => users.id),
	followerId: uuid("follower_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
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
