import { useLocalSearchParams } from "expo-router";
import { Post } from "@vittles/app";

export default function PostPage() {
	const { postTitle } = useLocalSearchParams<{ postTitle: string }>();

	return <Post slug={postTitle} />;
}
