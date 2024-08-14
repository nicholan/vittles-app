import { router } from "./trpc";
import { userRouter } from "./routes/user";
import { chamberRouter } from "./routes/chamber";

export const appRouter = router({
	user: userRouter,
	chamber: chamberRouter,
});

export type AppRouter = typeof appRouter;
