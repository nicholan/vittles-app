import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from "@vittles/ui";
import { View } from "react-native";
import { match } from "ts-pattern";
import { empty, error, loading, success, fetching } from "../../utils/trpc/pattern";
import { trpc } from "../../utils/trpc/trpc";
import { timeAgo } from "../../utils/string";

type CardProps = {
	title: string;
	content: string;
	author: string;
	createdAt: Date;
	updatedAt: Date | null;
};

const CreateCard = ({ title, content, createdAt, author }: CardProps) => {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<Text>{content}</Text>
			</CardContent>
			<CardFooter className="flex flex-row gap-2">
				<Text>{author}</Text>
				<Text>- {timeAgo(createdAt)}</Text>
			</CardFooter>
		</Card>
	);
};

type PostProps = {
	slug: string;
};

export const Post = ({ slug }: PostProps) => {
	const data = trpc.post.getPost.useQuery({ slug });

	const postsLayout = match(data)
		.with(loading, () => <Text>Loading...</Text>)
		.with(fetching, () => <Text>Fetching...</Text>)
		.with(success, () => <CreateCard {...data.data} />)
		.with(error, () => <Text>{data.failureReason?.message}</Text>)
		.with(empty, () => <Text>No posts</Text>)
		.otherwise(() => <Text>{data.failureReason?.message}</Text>);

	return <View className="flex flex-col items-center mt-4 gap-4">{postsLayout}</View>;
};
