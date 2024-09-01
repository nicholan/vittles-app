import { Post } from "@vittles/app";
import { Text } from "@vittles/ui";
import { useLocalSearchParams } from "expo-router";

export default function PostPage() {
	const params = useLocalSearchParams<{ postId: string }>();
	let postId: number;

	try {
		postId = Number.parseInt(params.postId);
	} catch (e) {
		console.error(e);
		return <Text>Post not found.</Text>;
	}

	return <Post postId={postId} queryType="post" />;
}
