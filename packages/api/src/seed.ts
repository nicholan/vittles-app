// Run this file with `bun run seed.ts <path-to-sql-file>`

import postgres from "postgres";

const path = Bun.argv[2];
const file = Bun.file(path);

// Connect to your PostgreSQL database
const sql = postgres(process.env.NEON_DATABASE_URL as string);

// Load and execute the SQL file
async function seedDatabase() {
	try {
		// Read the SQL file
		const seedSQL = await file.text();

		// Execute the SQL commands
		await sql.begin(async (sql) => {
			await sql.unsafe(seedSQL);
		});

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		// Close the database connection
		await sql.end();
	}
}

seedDatabase();
