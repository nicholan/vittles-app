import { useSessionContext } from "@supabase/auth-helpers-react";
import type { Provider } from "@supabase/supabase-js";
import { useSupabase } from "@vittles/app/utils/supabase/hooks/useSupabase";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export const SignUpScreen = (): React.ReactNode => {
	const supabase = useSupabase();
	const { session, isLoading, error } = useSessionContext();
	const user = session?.user;

	const handleOAuthSignInWithPress = async (provider: Provider) => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: provider,
		});

		if (error) {
			console.log("Failed OAuth sign in.");
			return;
		}

		console.log("Signed in successfully.");
	};

	const handleAnonymousSignIn = async () => {
		const { data, error } = await supabase.auth.signInAnonymously();

		if (error) {
			console.log("Failed anonymous sign in.");
			return;
		}

		console.log("Signed in successfully.");
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	return (
		<View>
			{user && (
				<>
					<Text>Hello, {user.id}</Text>
					<Button title="Sign out" onPress={() => handleSignOut()} />
				</>
			)}
			{!user && (
				<>
					<Text>Sign up</Text>
					<Button title="Sign in with Google" onPress={() => handleOAuthSignInWithPress("google")} />
					<Button title="Sign in anonymously" onPress={() => handleAnonymousSignIn()} />
				</>
			)}
		</View>
	);
};
