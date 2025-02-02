import { ActivityIndicator, View } from "react-native";

export function LoadingSpinner() {
	return (
		<View className="flex-1 justify-center items-center">
			<ActivityIndicator size="large" color="#0000ff" />
		</View>
	);
}
