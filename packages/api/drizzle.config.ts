import type { Config } from "drizzle-kit";

export default {
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: "",
		databaseId: "",
		token: "",
	},
	verbose: false,
	strict: true,
} satisfies Config;
