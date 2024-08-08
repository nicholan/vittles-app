import { useUser as useUserOg } from "@supabase/auth-helpers-react";

export default function useUser() {
	const data = useUserOg();

	// TODO: Get user related info.

	return data;
}
