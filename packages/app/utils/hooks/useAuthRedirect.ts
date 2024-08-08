import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useAuthRedirect = () => {
	const router = useRouter();
	const supabase = useSupabase();

	useEffect(() => {
		const signOutListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
			if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
				router.replace("/");
			}
		});

		return () => {
			signOutListener.data.subscription.unsubscribe();
		};
	}, [router, supabase]);
};
