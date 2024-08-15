import { View } from "react-native";

export const GestureHandlerRootView = ({ children, className = "flex-1" }) => {
	return <View className={className}>{children}</View>;
};
