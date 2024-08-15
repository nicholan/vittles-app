import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { integer, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

// Users
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	authId: varchar("auth_id", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 50 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	bio: varchar("bio", { length: 255 }),
	profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

// User can have many posts, user can subscribe to many chambers
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
	userChambers: many(usersToChambers),
}));

// A join table for users-chambers.
export const usersToChambers = pgTable(
	"users_to_chambers",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => users.id),
		chamberId: integer("chamber_id")
			.notNull()
			.references(() => chambers.id),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.chamberId, table.userId] }),
	}),
);

// Users-chambers join table many-to-many relations.
export const usersToChambersRelations = relations(usersToChambers, ({ one }) => ({
	user: one(users, {
		fields: [usersToChambers.userId],
		references: [users.id],
	}),
	chamber: one(chambers, {
		fields: [usersToChambers.chamberId],
		references: [chambers.id],
	}),
}));

// -------------------------------------------------------- //

// Posts
export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content").notNull(),
	authorId: integer("author_id")
		.notNull()
		.references(() => users.id),
	chamberName: varchar("chamber_name", { length: 50 }).references(() => chambers.name),
	slug: varchar("slug"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

// A post can have one author (posts.authorId references users.id).
// A post can have many comments.
// TODO: Is it correct?
export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
	comments: many(comments),
	chamber: one(chambers, {
		fields: [posts.chamberName],
		references: [chambers.name],
	}),
}));

// -------------------------------------------------------- //

// Comments
// To get the top-level comments for a specific post, you can query comments where parent_comment_id is NULL.
export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	authorId: integer("author_id").notNull(),
	postId: integer("post_id").notNull(),
	parentCommentId: integer("parent_comment_id"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

// A comment can belong to one post (comments.postId references posts.id).
// A comment can be a comment to another comment. (comments.parentCommentId references comments.id).
export const commentsRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	parentComment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
	}),
}));

// -------------------------------------------------------- //

// Chambers are sub-communties that user can subscribe to and create posts in.
export const chambers = pgTable("chambers", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => sql`now()`),
});

export const chamberRelations = relations(chambers, ({ many }) => ({
	users: many(usersToChambers),
}));

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

export type Comment = InferSelectModel<typeof comments>;
export type InserComment = InferInsertModel<typeof comments>;
// export const insertCommentchema = createInsertSchema(comments);
// export const selectCommentSchema = createSelectSchema(comments);

export type Chamber = InferSelectModel<typeof chambers>;
export type InserChamber = InferInsertModel<typeof chambers>;
// export const insertChamberchema = createInsertSchema(chambers);
// export const selectChamberSchema = createSelectSchema(chambers);
