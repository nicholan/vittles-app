import { handleOAuthSignIn } from "@vittles/app/utils/supabase/actions/actions";
import { handleEmailSignIn } from "@vittles/app/utils/supabase/actions/shared";
import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export const Login = (): React.ReactNode => {
	return (
		<View className="flex-1 items-center justify-center gap-2">
			<Button title="Google" onPress={() => handleOAuthSignIn("google")} />

			<Text>
				No account? Go to{" "}
				<Link href="register" push={true}>
					<Text className="underline">Register</Text>
				</Link>
			</Text>
		</View>
	);
};
