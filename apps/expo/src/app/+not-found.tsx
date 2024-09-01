import { H2, Text } from "@vittles/ui";
import { Link } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
	return (
		<View className="flex flex-col grow justify-center items-center gap-4">
			<Text className="font-bold text-lg">Page not found.</Text>
			<Link href="/">
				<Text className="underline">Go to home screen.</Text>
			</Link>
		</View>
	);
}
