import { postRouter } from "./routes/post";
import { userRouter } from "./routes/user";
import { router } from "./trpc";

export const appRouter = router({
	user: userRouter,
	post: postRouter,
});

export type AppRouter = typeof appRouter;
