import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { trpc } from "../../utils/trpc/trpc";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";

export function Home() {
	const queryDispatchTable = {
		following: () => trpc.post.getFeedPosts.useQuery(),
		discover: () => trpc.post.getFeedPosts.useQuery(),
	};

	return (
		<MainColumnsLayout>
			<TabsFlatlist queryDispatchTable={queryDispatchTable} />
		</MainColumnsLayout>
	);
}
