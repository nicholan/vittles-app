import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createContext } from "./context";
import { appRouter } from "./router";

type Bindings = {
	DB: D1Database;
	JWT_VERIFICATION_KEY: string;
	APP_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Frontend CORS
app.use("/trpc/*", async (c, next) => {
	if (c.env.APP_URL === undefined) {
		console.log("CORS: APP_URL is not set.");
	}

	return await cors({
		origin: (origin) => (origin.endsWith(new URL(c.env.APP_URL).host) ? origin : c.env.APP_URL),
		credentials: true,
		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
		// https://hono.dev/middleware/builtin/cors#options
	})(c, next);
});

// TRPC server with context
app.use("/trpc/*", async (c, next) => {
	return await trpcServer({
		router: appRouter,
		createContext: async (opts, c) => {
			return await createContext(c.env.DB, c.env.JWT_VERIFICATION_KEY, opts);
		},
	})(c, next);
});

export default app;
