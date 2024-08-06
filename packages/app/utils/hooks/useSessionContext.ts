import { useSessionContext as useSessionContextOG } from "@supabase/auth-helpers-react";
import type { SessionContext } from "@supabase/auth-helpers-react";

export const useSessionContext = (): SessionContext => {
	return useSessionContextOG();
};
