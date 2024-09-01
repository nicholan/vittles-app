import { Bell, House, Mail, Search, User } from "@vittles/ui";
import { Tabs } from "expo-router";
import { useResponsiveLayout, useColorScheme } from "@vittles/app";
import { BlurView } from "expo-blur";

export default function TabsLayout() {
	const { drawerType } = useResponsiveLayout();
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					display: drawerType === "permanent" ? "none" : "flex",
					position: "absolute",
					borderWidth: 0,
				},
				tabBarShowLabel: false,
				tabBarBackground: () => (
					<BlurView tint={colorScheme === "dark" ? "dark" : "default"} intensity={50} style={{ flex: 1 }} />
				),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					tabBarLabel: "Home",
					tabBarIcon: ({ color }) => <House size={22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					headerShown: false,
					tabBarLabel: "Explore",
					tabBarIcon: ({ color }) => <Search size={22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="notifications"
				options={{
					headerShown: false,
					tabBarLabel: "Notifications",
					tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="messages"
				options={{
					headerShown: false,
					tabBarLabel: "Messages",
					tabBarIcon: ({ color }) => <Mail size={22} color={color} />,
				}}
			/>
		</Tabs>
	);
}
