import { useSessionContext } from "@supabase/auth-helpers-react";
import { useSegments } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export const Logout = () => {
	const { supabaseClient, session } = useSessionContext();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (!segments.includes("logout")) return;

		supabaseClient.auth.signOut();
		// @ts-ignore set session does not call subscribers when session is updated
		supabaseClient.auth._notifyAllSubscribers("SIGNED_OUT", session);

		router.navigate("/");
	}, [session, supabaseClient, segments, router]);

	return null;
};
