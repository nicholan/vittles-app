import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export const RegisterScreen = (): React.ReactNode => {
	const { supabaseClient, session } = useSessionContext();

	const handleSignOut = async () => {
		await supabaseClient.auth.signOut();
	};

	return (
		<View className="flex-1 items-center justify-center gap-2">
			<Button onPress={() => handleSignOut()} title="Register" />
		</View>
	);
};
