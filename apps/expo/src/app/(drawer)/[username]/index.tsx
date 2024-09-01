import { Profile } from "@vittles/app";
import { useLocalSearchParams } from "expo-router";

export default function ProfilePage() {
	const { username } = useLocalSearchParams<{ username: string }>();

	return <Profile username={username} />;
}
