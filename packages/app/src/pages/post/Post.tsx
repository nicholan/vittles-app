import type { ListRenderItem } from "react-native";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";
import { CustomFlatList } from "../../features/flatlist/FlatList";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { PostCard } from "../../features/post-card/PostCard";
import { PostCardMain } from "../../features/post-card/PostCardMain";
import { trpc } from "../../utils/trpc/trpc";

const queryDispatchTable = {
	post: (postId: number) => trpc.post.getPost.useQuery({ postId }),
	comments: (postId: number) => trpc.post.getComments.useQuery({ postId }),
	postWithDepth2: (postId: number) => trpc.post.getPostWithDepth2.useQuery({ postId }),
};

type QueryType = keyof typeof queryDispatchTable;

type PostProps = {
	queryType: QueryType;
	postId: number;
};

// TODO: Show basepost at top, with comments below.
export function Post({ queryType, postId }: PostProps) {
	const postQuery = queryDispatchTable[queryType](postId);
	const commentsQuery = queryDispatchTable.comments(postId);

	const renderItem: ListRenderItem<(typeof postQuery.data)[0]> = ({ item }) => (
		<PostCard key={item.postId} {...item} />
	);

	const layout = match(postQuery)
		.with({ isLoading: true }, () => null)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, () => <PostCardMain {...postQuery.data[0]} />)
		.otherwise(() => null);

	return (
		<MainColumnsLayout>
			<ScrollView showsVerticalScrollIndicator={false} className="">
				{layout}
				<CustomFlatList data={commentsQuery} renderItem={renderItem} />
			</ScrollView>
		</MainColumnsLayout>
	);
}
