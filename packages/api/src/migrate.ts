import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema";
import postgres from "postgres";
import "dotenv/config";

async function makeMigrations() {
	const client = postgres(process.env.NEON_DATABASE_URL as string);
	try {
		const db = drizzle(client, { schema });
		await migrate(db, { migrationsFolder: "../drizzle" });
	} catch (error) {
		console.error(error);
	} finally {
		await client.end();
	}
}

makeMigrations();
