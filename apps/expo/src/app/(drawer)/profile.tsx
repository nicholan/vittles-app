import { Profile } from "@vittles/app/features/profile/Profile";
import { useSessionContext } from "@vittles/app/utils/hooks/useSessionContext";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const { session } = useSessionContext();
	const id = session?.user?.id;

	useEffect(() => {
		if (!id) {
			router.replace("login");
		}
	}, [router, id]);

	if (!id) return null;

	return <Profile />;
}
