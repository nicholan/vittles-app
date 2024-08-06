import { Text, View } from "react-native";

export function Footer() {
	return (
		<View className={"p-2 items-center justify-center native:hidden"}>
			<Text className={"text-black dark:text-white"}>© {new Date().getFullYear()} Nicholas Anttila</Text>
		</View>
	);
}
