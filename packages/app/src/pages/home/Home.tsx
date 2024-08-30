import { SafeAreaView } from "react-native-safe-area-context";
import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { trpc } from "../../utils/trpc/trpc";

export function Home() {
	const queryDispatchTable = {
		following: () => trpc.post.getFeedPosts.useQuery(),
		discover: () => trpc.post.getFeedPosts.useQuery(),
	};

	return (
		<SafeAreaView className="flex-1 flex-col max-w-xl">
			<TabsFlatlist queryDispatchTable={queryDispatchTable} />
		</SafeAreaView>
	);
}
