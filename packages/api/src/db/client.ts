import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Bindings } from "../worker";

export const createDb = ({ NEON_DATABASE_URL }: Bindings) => {
	return drizzle(neon(NEON_DATABASE_URL), { logger: true });
};
