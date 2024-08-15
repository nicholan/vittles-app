import { chamberRouter } from "./routes/chamber";
import { postRouter } from "./routes/post";
import { userRouter } from "./routes/user";
import { router } from "./trpc";

export const appRouter = router({
	user: userRouter,
	chamber: chamberRouter,
	post: postRouter,
});

export type AppRouter = typeof appRouter;
