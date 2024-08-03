import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";

// User
export const UserTable = sqliteTable("User", {
	id: text("id").primaryKey(),
});

export type User = InferSelectModel<typeof UserTable>;
export type InsertUser = InferInsertModel<typeof UserTable>;
export const insertUserSchema = createInsertSchema(UserTable);
export const selectUserSchema = createSelectSchema(UserTable);
