import { Text } from "@vittles/ui";
import { View } from "react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

export const Sidebar = () => {
	const { isSidebarVisible } = useResponsiveLayout();

	if (isSidebarVisible) {
		return (
			<View className="justify-center items-center flex-1 max-w-sm">
				<Text>Sidebar Content</Text>
			</View>
		);
	}

	return null;
};
