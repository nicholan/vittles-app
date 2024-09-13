import { ScrollView, FlatList, View } from "react-native";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { trpc } from "../../utils/trpc/trpc";
import { useState } from "react";
import { Thread } from "../../features/thread/Thread";
import { Inbox } from "../../features/inbox/Inbox";

export const Messages = () => {
	const inboxQuery = trpc.message.getMessageThreads.useQuery();
	const [selectedThread, setSelectedThread] = useState<number>(null);

	const threadQuery = trpc.message.getThread.useQuery({ threadId: selectedThread }, { enabled: !!selectedThread });

	return (
		<MainColumnsLayout>
			<Inbox query={inboxQuery} setSelectedThread={setSelectedThread} />
		</MainColumnsLayout>
	);
};
