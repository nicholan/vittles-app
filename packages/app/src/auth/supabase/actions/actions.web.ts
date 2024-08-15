import type { Provider } from "@supabase/supabase-js";
import { supabase } from "../client";

export const handleOAuthSignIn = async (provider: Provider) => {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: provider,
		options: {
			scopes:
				provider === "google"
					? "https://www.googleapis.com/auth/userinfo.email, https://www.googleapis.com/auth/userinfo.profile"
					: "read:user user:email",
		},
	});

	if (error) {
		console.log(`${provider} sign in failed.`);
		return;
	}

	console.log("Signed in successfully.");
};

const handleOAuthSignUp = async (provider: Provider) => {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: provider,
		options:
			provider === "google"
				? {
						queryParams: {
							access_type: "offline",
							prompt: "consent",
						},
					}
				: {},
	});

	if (error) {
		console.log(`${provider} sign up failed.`);
		return;
	}
};
