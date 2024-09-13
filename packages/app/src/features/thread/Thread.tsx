import { FlatList, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { match } from "ts-pattern";
import { Card, Text, Muted, LoadingSpinner } from "@vittles/ui";
import { Image } from "expo-image";
import type { AppRouter } from "@vittles/api";
import type { inferProcedureOutput } from "@trpc/server";
import { formatDate, shortenText, formatCount } from "../../utils/string";
import type { InferQueryResult } from "@trpc/react-query/dist/utils/inferReactQueryProcedure";

type MessageArr = inferProcedureOutput<AppRouter["message"]["getThread"]>;

// TODO: Message layout.
const ChatLayout = ({ thread }: { thread: MessageArr }) => {
	const keyExtractor = (item: MessageArr[number], index: number) => `${item.messageId}-${index}`;

	const renderItem: ListRenderItem<MessageArr[number]> = ({ item }) => {
		const deleted = <Muted>{item.sentByCurrentUser ? "You" : item.displayName} deleted this message.</Muted>;
		const content = <Text>{item.content}</Text>;
		const message = (
			<View className="flex-1">
				<Card className={`rounded-full ${item.sentByCurrentUser ? "flex-end" : "flex-start"}`}>
					{item.deleted ? deleted : content}
				</Card>
			</View>
		);

		return message;
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

type ThreadProps = {
	query: InferQueryResult<AppRouter["message"]["getThread"]>;
};

export const Thread = ({ query }: ThreadProps) => {
	const layout = match(query)
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			return <ChatLayout thread={data} />;
		})
		.otherwise(() => null);

	return layout;
};
