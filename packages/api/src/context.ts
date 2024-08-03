import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createDb } from "./db/client";

// JWT_VERIFICATION_KEY

interface User {
	id: string;
}

interface ApiContextProps {
	user: User | null;
	db: DrizzleD1Database;
	[key: string]: unknown;
}

export const createContext = async (
	d1: D1Database,
	JWT_VERIFICATION_KEY: string,
	opts: FetchCreateContextFnOptions,
): Promise<ApiContextProps> => {
	const db = createDb(d1);

	async function getUser() {
		// TODO: Implement user fetching logic
		const sessionToken = opts.req.headers.get("authorization")?.split(" ")[1];
		return null;
	}

	const user = await getUser();

	return { user, db };
};

export type Context = inferAsyncReturnType<typeof createContext>;
