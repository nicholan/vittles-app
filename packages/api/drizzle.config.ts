import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	verbose: true,
	strict: true,
	dbCredentials: {
		host: "localhost",
		port: 5432,
		password: "postgrespassword",
		database: "postgresdatabase",
	},
});
