import { useUser as useUserOg } from "@supabase/auth-helpers-react";

export function useUser() {
	const data = useUserOg();

	// TODO: Get user related info.

	return data;
}
