import { supabase } from "../client";

export const resetPasswordForEmail = async (email: string) => {
	const { error } = await supabase.auth.resetPasswordForEmail(email);

	if (error) {
		console.log("Password reset request failed", error);
		return;
	}
};

export const handleEmailSignIn = async (email: string, password: string) => {
	const { error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password,
	});

	if (error) {
		console.log("Sign in failed.");
		console.log(error.message);
		return;
	}
};

export const handleEmailSignUp = async (email: string, password: string) => {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) {
		console.log("error", error);
	} else if (data?.user) {
		console.log("Check email for confirmation");
	}
};

export const handlePasswordUpdate = async (password: string) => {
	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		console.log("Password change failed", error);
		return;
	}
};
