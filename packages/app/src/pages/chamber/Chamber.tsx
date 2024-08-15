import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from "@vittles/ui";
import { View } from "react-native";
import { match, P } from "ts-pattern";
import { empty, error, loading, success, fetching } from "../../utils/trpc/pattern";
import { trpc } from "../../utils/trpc/trpc";
import { Link } from "expo-router";

type CardProps = {
	title: string;
	content: string;
	username: string;
	slug: string;
	chamberName: string;
};

const CreateCard = ({ title, content, username, slug, chamberName }: CardProps) => {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<Link
					href={{
						pathname: "/c/[chamberName]/[postTitleSlug]",
						params: { chamberName, postTitleSlug: slug },
					}}
					push={true}
				>
					<CardTitle>{title}</CardTitle>
				</Link>
			</CardHeader>
			<CardContent>
				<Text>{content}</Text>
			</CardContent>
			<CardFooter>
				<Text>By: {username}</Text>
			</CardFooter>
		</Card>
	);
};

type ChamberProps = {
	chamberName: string;
};

export const Chamber = ({ chamberName }: ChamberProps) => {
	const data = trpc.post.getPostsInChamber.useQuery({ chamberName });

	const postsLayout = match(data)
		.with(loading, () => <Text>Loading...</Text>)
		.with(fetching, () => <Text>Fetching...</Text>)
		.with(success, () =>
			data.data.map((post) => <CreateCard key={post.postId} {...post} chamberName={chamberName} />),
		)
		.with(error, () => <Text>{data.failureReason?.message}</Text>)
		.with(empty, () => <Text>No posts</Text>)
		.otherwise(() => <Text>{data.failureReason?.message}</Text>);

	return <View className="flex flex-col items-center mt-4 gap-4">{postsLayout}</View>;
};
