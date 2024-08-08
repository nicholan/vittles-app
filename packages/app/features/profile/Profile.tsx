import useUser from "@vittles/app/utils/hooks/useUser";
import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export const Profile = (): React.ReactNode => {
	const { email, created_at, last_sign_in_at, id } = useUser();

	return (
		<View className="flex-1 items-center justify-center gap-2">
			<Text>Id: {id}</Text>
			<Text>Email: {email}</Text>
			<Text>Created at: {created_at}</Text>
			<Text>Last online: {last_sign_in_at}</Text>
		</View>
	);
};
