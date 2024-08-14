import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createContext } from "./context";
import { appRouter } from "./router";

// https://hono.dev/docs/getting-started/cloudflare-workers#bindings
export type Bindings = {
	JWT_VERIFICATION_KEY: string;
	APP_URL: string;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	NEON_DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

const devHosts = [
	"http://localhost:3000",
	"http://localhost:8081",
	"http://localhost:8082",
	"http://172.17.165.125:8081",
];

// app.use("/trpc/*", async (c, next) => {
// 	if (c.env.APP_URL === undefined) {
// 		console.error("CORS: APP_URL is not set.");
// 	}

// 	return await cors({
// 		origin: (origin) => (origin.endsWith(new URL(c.env.APP_URL).host) ? origin : c.env.APP_URL),
// 		credentials: true,
// 		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
// 		// https://hono.dev/middleware/builtin/cors#options
// 	})(c, next);
// });

app.use(
	"/trpc/*",
	cors({
		origin: devHosts,
		credentials: true,
		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
	}),
);

// TRPC server with context
app.use("/trpc/*", async (c, next) => {
	return await trpcServer({
		router: appRouter,
		createContext: async (opts, c) => {
			return await createContext(c.env, opts);
		},
	})(c, next);
});

export default app;
