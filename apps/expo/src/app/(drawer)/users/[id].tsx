import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function UserPage() {
	const { id } = useLocalSearchParams();

	return (
		<View>
			<Text>User page for ID: {id}</Text>
		</View>
	);
}
