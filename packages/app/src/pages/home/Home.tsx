import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { trpc } from "../../utils/trpc/trpc";

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
