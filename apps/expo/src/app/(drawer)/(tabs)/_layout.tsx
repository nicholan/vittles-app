import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" options={{ headerShown: false, tabBarLabel: "Home" }} />
			<Tabs.Screen name="browse" options={{ headerShown: false, tabBarLabel: "Browse" }} />
			<Tabs.Screen name="search" options={{ headerShown: false, tabBarLabel: "Search" }} />
		</Tabs>
	);
}
