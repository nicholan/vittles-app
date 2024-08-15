import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "@vittles/ui";

export default function UserPage() {
	const { username } = useLocalSearchParams<{ username: string }>();

	return (
		<View>
			<Text>User page for ID: {username}</Text>
		</View>
	);
}
