import { useSessionContext } from "@vittles/app";
import { LoadingSpinner } from "@vittles/ui";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";

// Drawer accessible on every screen.
export default function DrawerLayout() {
	const { session, isLoading } = useSessionContext();

	const user = session?.user?.id;

	if (isLoading) return <LoadingSpinner />;

	return (
		<Drawer>
			<Drawer.Screen
				name="(tabs)"
				options={{
					drawerLabel: "Home",
					title: "Home",
				}}
			/>
			<Drawer.Screen
				name="profile"
				options={{
					drawerLabel: "Profile",
					title: "Profile",
					drawerItemStyle: { display: user ? "flex" : "none" },
				}}
			/>
			<Drawer.Screen
				name="settings"
				options={{
					drawerLabel: "Settings",
					title: "Settings",
				}}
			/>
			<Drawer.Screen
				name="(auth)/login"
				options={{
					drawerLabel: "Login",
					title: "Login",
					drawerItemStyle: { display: user ? "none" : "flex" },
				}}
			/>
			<Drawer.Screen
				name="(auth)/logout"
				options={{
					drawerLabel: "Logout",
					title: "Logout",
					drawerItemStyle: { display: user ? "flex" : "none" },
				}}
			/>
			{/* Hidden from drawer.*/}
			<Drawer.Screen
				name="u/[username]"
				options={{
					drawerItemStyle: { display: "none" },
				}}
			/>
			<Drawer.Screen
				name="(auth)/register"
				options={{
					drawerLabel: "Register",
					title: "Register",
					drawerItemStyle: { display: "none" },
				}}
			/>
		</Drawer>
	);
}
