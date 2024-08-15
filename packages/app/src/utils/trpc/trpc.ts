import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@vittles/api";

export const trpc = createTRPCReact<AppRouter>();
