import { View } from "react-native";

export const GestureHandlerRootView = ({ children }) => {
	return <View className={"flex-1"}>{children}</View>;
};
