import { Text } from "@vittles/ui";
import { View } from "react-native";
import { useUser } from "../../hooks/useUser";

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
