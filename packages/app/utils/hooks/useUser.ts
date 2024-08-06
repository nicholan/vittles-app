import { useSessionContext } from "@supabase/auth-helpers-react";

export const useUser = () => {
	const { session, isLoading, error } = useSessionContext();
	const user = session?.user;

	// Fetch user related data?
	return user;
};
