import { useSessionContext } from "@supabase/auth-helpers-react";
import { useSegments } from "expo-router";
import { useEffect } from "react";

export const Logout = () => {
	const { supabaseClient, session } = useSessionContext();
	const segments = useSegments();

	useEffect(() => {
		if (!segments.includes("logout")) return;

		supabaseClient.auth.signOut();
		// @ts-ignore set session does not call subscribers when session is updated
		supabaseClient.auth._notifyAllSubscribers("SIGNED_OUT", session);
	}, [session, supabaseClient, segments]);

	return null;
};
