import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { createDb } from "./db/client";
import type { Bindings } from "./worker";

type User = {
	id: string;
};

type ApiContextProps = {
	user: User | null;
	db: NeonHttpDatabase;
	[key: string]: unknown;
};

export const createContext = async (env: Bindings, opts: FetchCreateContextFnOptions): Promise<ApiContextProps> => {
	const db = createDb(env);
	const user = await getUserFromSessionToken(opts, env.JWT_VERIFICATION_KEY);

	return { user, db };
};

export type Context = inferAsyncReturnType<typeof createContext>;

async function getUserFromSessionToken(
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
