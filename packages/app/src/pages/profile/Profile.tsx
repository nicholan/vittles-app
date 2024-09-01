import { SafeAreaView } from "react-native-safe-area-context";
import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { UserCard } from "../../features/user-card/UserCard";
import { trpc } from "../../utils/trpc/trpc";
import { ScrollView } from "react-native";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { match } from "ts-pattern";

type ProfileProps = {
	username: string;
};

export const Profile = ({ username }: ProfileProps) => {
	const userQuery = trpc.user.getUserByUsername.useQuery({ username });
	const currentUser = trpc.user.getCurrentUser.useQuery();
	const isOwnProfile = currentUser.isSuccess && currentUser.data?.username === username;

	const queryDispatchTable = {
		posts: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		replies: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		media: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		likes: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
	};

	const layout = match(userQuery)
		.with({ isLoading: true }, () => null)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			return <UserCard variant="profileCard" {...data} isOwnProfile={isOwnProfile} />;
		})
		.otherwise(() => null);

	return (
		<MainColumnsLayout>
			<ScrollView showsVerticalScrollIndicator={false}>
				{layout}
				<TabsFlatlist queryDispatchTable={queryDispatchTable} queryValue={{ username }} />
			</ScrollView>
		</MainColumnsLayout>
	);
};
