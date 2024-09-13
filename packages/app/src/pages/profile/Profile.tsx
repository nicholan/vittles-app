import { ScrollView } from "react-native";
import { match } from "ts-pattern";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { UserCard } from "../../features/user-card/UserCard";
import { trpc } from "../../utils/trpc/trpc";

type ProfileProps = {
	username: string;
};

export const Profile = ({ username }: ProfileProps) => {
	const userQuery = trpc.user.getUserByUsername.useQuery({ username });
	const currentUser = trpc.user.getCurrentUser.useQuery();
	const isOwnProfile = currentUser.isSuccess && currentUser.data?.username === username;

	const queryDispatchTable = {
		posts: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		replies: (args: { username: string }) => trpc.post.getRepliesByUsername.useQuery(args),
		media: (args: { username: string }) => trpc.post.getMediaByUsername.useQuery(args),
		likes: (args: { username: string }) => trpc.post.getLikedPostsByUsername.useQuery(args),
	};

	const userProfileCard = match(userQuery)
		.with({ isLoading: true }, () => null)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			return <UserCard variant="profileCard" {...data} isOwnProfile={isOwnProfile} />;
		})
		.otherwise(() => null);

	return (
		<MainColumnsLayout>
			<ScrollView showsVerticalScrollIndicator={false}>
				{userProfileCard}
				<TabsFlatlist queryDispatchTable={queryDispatchTable} queryValue={{ username }} />
			</ScrollView>
		</MainColumnsLayout>
	);
};
