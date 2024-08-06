import { useSessionContext } from "@vittles/app/utils/hooks/useSessionContext";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function ProfilePage() {
	const router = useRouter();
	const { session } = useSessionContext();
	const id = session?.user?.id;

	useEffect(() => {
		if (!session?.user?.id) {
			router.replace("login");
		}
	}, [router, session]);

	return (
		<View>
			<Text>Profile of ID: {id}</Text>
		</View>
	);
}
