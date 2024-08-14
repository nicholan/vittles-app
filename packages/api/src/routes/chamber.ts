import { eq } from "drizzle-orm";
import * as v from "valibot";
import { chambers } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

const insertChamberSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3)),
	description: v.optional(v.pipe(v.string(), v.maxLength(50))),
});

const selectChamberSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3)),
});

export const chamberRouter = router({
	getChamberbyName: protectedProcedure
		.input((raw) => v.parse(selectChamberSchema, raw))
		.query(async ({ ctx, input }) => {
			const chamber = await ctx.db.select().from(chambers).where(eq(chambers.name, input.name));
			return chamber;
		}),

	createNewChamber: protectedProcedure
		.input((raw) => v.parse(insertChamberSchema, raw))
		.mutation(async ({ ctx, input }) => {
			try {
				const exists =
					(await ctx.db.select().from(chambers).where(eq(chambers.name, input.name)).limit(1)).length > 0;
				if (exists) {
					return {
						status: 400,
						message: "Chamber name already in use.",
					};
				}

				const chamber = await ctx.db.insert(chambers).values(input).returning();
				return { status: 200, data: chamber };
			} catch (error) {
				return {
					status: 503,
					message: "An unexpected error occurred",
				};
			}
		}),
});
