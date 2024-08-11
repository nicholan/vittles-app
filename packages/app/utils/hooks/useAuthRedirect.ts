import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../supabase/client";

export const useAuthRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		const signOutListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
			if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
				router.navigate("/");
			}
		});

		return () => {
			signOutListener.data.subscription.unsubscribe();
		};
	}, [router]);
};
