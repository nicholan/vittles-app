import { useSessionContext } from "@vittles/app/utils/hooks/useSessionContext";
import { LoadingSpinner } from "@vittles/ui/src/components/spinner/Spinner";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

// FIXME logout on mobile doesnt always redirect to home.
export default function LogoutPage() {
	const router = useRouter();
	const { supabaseClient, isLoading } = useSessionContext();

	useEffect(() => {
		supabaseClient.auth
			.signOut()
			.then(() => {
				router.push("/");
			})
			.catch((err) => {
				console.log(err);
				return (
					<View className="flex-1 items-center justify-center gap-2">
						<Text>Something went wrong.</Text>
						<Link href={"/"}>
							<Text className="underline">Click here to return to Home.</Text>
						</Link>
					</View>
				);
			});
	}, [router, supabaseClient]);

	if (isLoading) return <LoadingSpinner />;
}
