import type { Provider } from "@supabase/supabase-js";
import { getInitialURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../client";

export const handleOAuthSignIn = async (provider: Provider) => {
	try {
		const redirectUri = (await getInitialURL()) ?? "vittles-app://";

		const response = await WebBrowser.openAuthSessionAsync(
			`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUri}`,
			redirectUri,
		);

		if (response.type === "success") {
			const { accessToken, refreshToken } = getTokensFromUrl(response.url);

			await supabase.auth
				.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				})
				.then(({ data: { session }, error }) => {
					if (session) {
						// @ts-ignore set session does not call subscribers when session is updated
						supabase.auth._notifyAllSubscribers("SIGNED_IN", session);
					} else {
						console.log(`${provider} sign in failed.`);
						console.log("Supabase session error:", error);
					}
				});
		}
	} catch (error) {
		console.log(`${provider} sign in failed.`);
		console.log(error);
	} finally {
		WebBrowser.maybeCompleteAuthSession();
	}
};

function getTokensFromUrl(url: string) {
	const params = new URLSearchParams(url.split("#")[1]);
	const accessToken = params.get("access_token") || "";
	const refreshToken = params.get("refresh_token") || "";

	return { accessToken, refreshToken };
}
