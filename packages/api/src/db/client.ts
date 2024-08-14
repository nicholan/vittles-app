import type { Bindings } from "../worker";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const createDb = ({ NEON_DATABASE_URL }: Bindings) => {
	return drizzle(neon(NEON_DATABASE_URL), { logger: true });
};
