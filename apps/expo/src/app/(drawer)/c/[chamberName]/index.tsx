import { Chamber } from "@vittles/app";
import { useLocalSearchParams } from "expo-router";

export default function ChamberPage() {
	const { chamberName } = useLocalSearchParams<{ chamberName: string }>();

	return <Chamber chamberName={chamberName} />;
}
