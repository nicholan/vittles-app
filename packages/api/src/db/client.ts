import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import type { Bindings } from "../worker";
import * as schema from "./schema";

// export const createDb = ({ NEON_DATABASE_URL }: Bindings) => {
// 	return drizzle(neon(NEON_DATABASE_URL), { logger: true });
// };

export const createDb = ({ NEON_DATABASE_URL }: Bindings) => {
	const client = postgres(NEON_DATABASE_URL);
	return drizzlePostgres(client, { schema });
};
