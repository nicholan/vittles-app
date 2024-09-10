import { postRouter } from "./routes/post";
import { userRouter } from "./routes/user";
import { fileRouter } from "./routes/file";
import { messageRouter } from "./routes/message";
import { notificationsRouter } from "./routes/notification";
import { router } from "./trpc";

export const appRouter = router({
	user: userRouter,
	post: postRouter,
	file: fileRouter,
	message: messageRouter,
	notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
