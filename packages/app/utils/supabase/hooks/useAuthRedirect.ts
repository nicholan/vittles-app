import { supabase } from "@vittles/app/utils/supabase/client";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export const useAuthRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_OUT") {
				router.replace("/");
			}
		});

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [router]);
};
