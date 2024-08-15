import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./db/schema";
import "dotenv/config";

async function makeMigrations() {
	const client = postgres(process.env.NEON_DATABASE_URL as string);
	try {
		const db = drizzle(client, { schema });
		await migrate(db, { migrationsFolder: "../drizzle" });
		console.log("Migrations complete.");
	} catch (error) {
		console.error("Migrations failed.");
		console.error(error);
	} finally {
		await client.end();
	}
}

makeMigrations();
