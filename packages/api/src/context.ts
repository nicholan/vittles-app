import type { S3Client } from "@aws-sdk/client-s3";
import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { createDb } from "./db/client";
import { createStorageClient } from "./db/r2";
import type { User } from "./db/schema";
import { users } from "./db/schema";
import { generateRandomName } from "./utils/name";
import type { Bindings } from "./worker";

export type ApiContextProps = {
	user: User | null;
	db: NeonHttpDatabase;
	r2: S3Client;
	env: Bindings;
	[key: string]: unknown;
};

export type Context = inferAsyncReturnType<typeof createContext>;

export const createContext = async (env: Bindings, opts: FetchCreateContextFnOptions): Promise<ApiContextProps> => {
	let user: User | null = null;
	const db = createDb(env);
	const r2 = createStorageClient(env);
	const auth = await getAuthIdFromSessionToken(opts, env.JWT_VERIFICATION_KEY);

	if (!auth) {
		return { user, db, r2, env };
	}

	const existingUser = await db.select().from(users).where(eq(users.id, auth.id));

	if (existingUser.length > 0) {
		user = existingUser[0];
	} else {
		// Create new user in database with random username if user record does not exist.
		const names = generateRandomName();
		const newUser = await db.insert(users).values({ id: auth.id, username: names, displayName: names }).returning();
		user = newUser[0];
	}

	return { user, db, r2, env };
};

async function getAuthIdFromSessionToken(
	opts: FetchCreateContextFnOptions,
	JWT_VERIFICATION_KEY: string,
): Promise<{ id: string } | null> {
	const sessionToken = opts.req.headers.get("authorization")?.split(" ")[1];

	if (sessionToken !== undefined && sessionToken !== "undefined") {
		if (!JWT_VERIFICATION_KEY) {
			console.error("Cloudflare worker JWT_VERIFICATION_KEY is not set.");
			return null;
		}

		try {
			// Verify token integrity.
			const authorized = await jwt.verify(sessionToken, JWT_VERIFICATION_KEY, {
				algorithm: "HS256",
			});

			if (!authorized) {
				return null;
			}

			// Decode if token is valid.
			const decodedToken = jwt.decode(sessionToken);
			if (decodedToken?.payload === undefined) return null;

			// Check token expiration.
			const expirationTimestamp = decodedToken.payload.exp;
			const currentTimestamp = Math.floor(Date.now() / 1000);
			if (!expirationTimestamp || expirationTimestamp < currentTimestamp) {
				return null;
			}

			const userId = decodedToken.payload?.sub;

			if (userId) {
				return {
					id: userId,
				};
			}
		} catch (e) {
			console.error(e);
		}
	}

	return null;
}
