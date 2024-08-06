import { useSessionContext } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";
import type { Provider } from "@supabase/supabase-js";
import { Link } from "expo-router";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export const LoginScreen = (): React.ReactNode => {
	const { supabaseClient } = useSessionContext();

	const handleOAuthSignInWithPress = async (provider: Provider) => {
		const { error } = await supabaseClient.auth.signInWithOAuth({
			provider: provider,
		});

		if (error) {
			console.log("Failed OAuth sign in.");
			return;
		}

		console.log("Signed in successfully.");
	};

	const handleAnonymousSignIn = async () => {
		const { data, error } = await supabaseClient.auth.signInAnonymously();

		if (error) {
			console.log("Failed anonymous sign in.");
			return;
		}

		console.log("Signed in successfully.");
	};

	return (
		<View className="flex-1 items-center justify-center gap-2">
			<Button title="Google" onPress={() => handleOAuthSignInWithPress("google")} />
			<Button title="Anonymous" onPress={() => handleAnonymousSignIn()} />
			<Text>
				No account? Go to{" "}
				<Link href="register">
					<Text className="underline">Register</Text>
				</Link>
			</Text>
		</View>
	);
};
