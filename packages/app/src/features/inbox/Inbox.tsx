import { ScrollView, FlatList, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { match } from "ts-pattern";
import { Card, Text, Muted, LoadingSpinner, Button } from "@vittles/ui";
import { Image } from "expo-image";
import type { AppRouter } from "@vittles/api";
import type { inferProcedureOutput } from "@trpc/server";
import { formatDate, shortenText, formatCount } from "../../utils/string";
import type { InferQueryResult } from "@trpc/react-query/dist/utils/inferReactQueryProcedure";

const ThreadAvatar = ({
	threadPictureUrl,
	size = 40,
	threadName,
}: { threadPictureUrl: string; size?: number; threadName: string }) => (
	<Image
		source={{ uri: threadPictureUrl ?? "https://avatars.githubusercontent.com/u/63797719?v=4" }}
		style={{ width: size, height: size, borderRadius: 10000 }}
		alt={`${threadName}'s avatar`}
	/>
);

type ThreadArr = inferProcedureOutput<AppRouter["message"]["getMessageThreads"]>;

type InboxLayoutProps = {
	thread: ThreadArr;
	setSelectedThread: React.Dispatch<React.SetStateAction<number | null>>;
};

const InboxLayout = ({ thread, setSelectedThread }: InboxLayoutProps) => {
	const keyExtractor = (item: ThreadArr[number], index: number) => `${item.threadId}-${index}`;

	const renderItem: ListRenderItem<ThreadArr[number]> = ({ item }) => {
		return (
			<Button variant="link" onPress={() => setSelectedThread(item.threadId)} className="flex-1">
				<Card>
					<View className="flex flex-row gap-2 items-center">
						<ThreadAvatar threadPictureUrl={item.threadPictureUrl} threadName={item.threadName} />
						<View className="flex flex-col">
							<View className="flex-1 flex-row justify-between">
								<Text>{item.threadName}</Text>
								<Text>{formatDate(item.latestMessageAt)}</Text>
							</View>
							<View className="flex-1 flex-row justify-between">
								<Text>{shortenText(item.latestMessage, 20)}</Text>
								{item.unreadCount > 0 && <Text>{formatCount(item.unreadCount)}</Text>}
							</View>
						</View>
					</View>
				</Card>
			</Button>
		);
	};

	return (
		<FlatList
			data={thread}
			keyExtractor={keyExtractor}
			renderItem={renderItem}
			showsVerticalScrollIndicator={false}
		/>
	);
};

type InboxProps = {
	query: InferQueryResult<AppRouter["message"]["getMessageThreads"]>;
	setSelectedThread: React.Dispatch<React.SetStateAction<number | null>>;
};

export const Inbox = ({ query, setSelectedThread }: InboxProps) => {
	const inbox = match(query)
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			return <InboxLayout thread={data} setSelectedThread={setSelectedThread} />;
		})
		.otherwise(() => null);

	return inbox;
};
