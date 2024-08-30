import { SafeAreaView } from "react-native-safe-area-context";
import { TabsFlatlist } from "../../features/tabs-flatlist/TabsFlatlist";
import { UserProfileCard } from "../../features/user-profile-card/UserProfileCard";
import { trpc } from "../../utils/trpc/trpc";
import { ScrollView } from "react-native";

type ProfileProps = {
	username: string;
};

export const Profile = ({ username }: ProfileProps) => {
	const currentUser = trpc.user.getCurrentUser.useQuery();
	const isOwnProfile = currentUser.isSuccess && currentUser.data?.username === username;

	const queryDispatchTable = {
		posts: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		replies: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		media: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
		likes: (args: { username: string }) => trpc.post.getPostsByUsername.useQuery(args),
	};

	return (
		<SafeAreaView className="flex-1 flex-col">
			<ScrollView showsVerticalScrollIndicator={false}>
				<UserProfileCard queryType={isOwnProfile ? "current" : "byUsername"} username={username} />
				<TabsFlatlist queryDispatchTable={queryDispatchTable} queryValue={{ username }} />
			</ScrollView>
		</SafeAreaView>
	);
};
