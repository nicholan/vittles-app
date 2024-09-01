import { useUser as useUserOg } from "@supabase/auth-helpers-react";
import { trpc } from "../utils/trpc/trpc";
import type { InferQueryResult } from "@trpc/react-query/dist/utils/inferReactQueryProcedure";
import type { AppRouter } from "@vittles/api";

type UserQuery = InferQueryResult<AppRouter["user"]["getCurrentUser"]>;

export function useUser(): UserQuery {
	const userAuth = useUserOg();
	const user = trpc.user.getCurrentUser.useQuery(null, { enabled: !!userAuth?.id });

	return user;
}
