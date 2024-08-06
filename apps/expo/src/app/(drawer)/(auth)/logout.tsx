import { useSessionContext } from "@vittles/app/utils/hooks/useSessionContext";
import { LoadingSpinner } from "@vittles/ui/src/components/spinner/Spinner";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function LogoutPage() {
	const router = useRouter();
	const { supabaseClient, isLoading } = useSessionContext();

	useEffect(() => {
		supabaseClient.auth
			.signOut()
			.then(() => {
				router.navigate("/");
			})
			.catch((err) => {
				return (
					<View className="flex-1 items-center justify-center gap-2">
						<Text>Something went wrong.</Text>
						<Link href={"/"}>
							<Text className="underline">Click here to return to Home.</Text>
						</Link>
					</View>
				);
			});
	}, [supabaseClient, router]);

	if (isLoading) return <LoadingSpinner />;
}
