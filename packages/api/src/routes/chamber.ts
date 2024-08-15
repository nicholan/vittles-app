import { eq, count } from "drizzle-orm";
import * as v from "valibot";
import { throwTRPCErrorOnCondition } from "../db/errors";
import { chambers, usersToChambers } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const insertChamberSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(3), v.toLowerCase()),
	description: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(255))),
});

const selectChamberSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(3), v.toLowerCase()),
});

export const chamberRouter = router({
	getChamberbyName: protectedProcedure
		.input((raw) => v.parse(selectChamberSchema, raw))
		.query(async ({ ctx, input }) => {
			const chamber = await ctx.db.select().from(chambers).where(eq(chambers.name, input.name));
			throwTRPCErrorOnCondition(chamber.length === 0, "NOT_FOUND", "Chamber");

			return chamber[0];
		}),

	getChambers: protectedProcedure.query(async ({ ctx }) => {
		const allChambers = await ctx.db.select().from(chambers);
		return allChambers;
	}),

	createNewChamber: protectedProcedure
		.input((raw) => v.parse(insertChamberSchema, raw))
		.mutation(async ({ ctx, input }) => {
			const exists = await ctx.db.select().from(chambers).where(eq(chambers.name, input.name)).limit(1);
			throwTRPCErrorOnCondition(exists.length > 0, "CONFLICT", "Chamber");

			const chamber = await ctx.db.insert(chambers).values(input).returning();
			return chamber[0];
		}),

	getChamberSubscriberCount: protectedProcedure
		.input((raw) => v.parse(selectChamberSchema, raw))
		.query(async ({ ctx, input }) => {
			const chamber = await ctx.db
				.select({ id: chambers.id })
				.from(chambers)
				.where(eq(chambers.name, input.name));

			const subscriberCount = await ctx.db
				.select({ subscriberCount: count() })
				.from(usersToChambers)
				.where(eq(usersToChambers.chamberId, chamber[0].id));

			return subscriberCount[0];
		}),
});
