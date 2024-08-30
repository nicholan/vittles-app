import type { TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/dist/shared";
import type { AppRouter } from "@vittles/api";
import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from "@vittles/ui";
import { useState } from "react";
import type { ListRenderItem } from "react-native";
import { CustomFlatList } from "../flatlist/FlatList";
import { ScrollView, Platform } from "react-native";
import { PostCard } from "../post-card/PostCard";
import { BlurView } from "expo-blur";

type TabsFlatlistProps<QueryArgs extends object, Item extends object> = {
	queryDispatchTable: Record<string, (args: QueryArgs) => UseTRPCQueryResult<Item[], TRPCClientErrorLike<AppRouter>>>;
	queryValue?: QueryArgs;
};

const ListHeaderTabs = ({ children }) => {
	return Platform.OS === "web" ? (
		children
	) : (
		<ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
			{children}
		</ScrollView>
	);
};

export const TabsFlatlist = <QueryArgs extends object, Item extends object>({
	queryDispatchTable,
	queryValue,
}: TabsFlatlistProps<QueryArgs, Item>) => {
	const values = Object.keys(queryDispatchTable);
	const [value, setValue] = useState(values[0]);
	const query = queryDispatchTable[value || values[0]](queryValue as QueryArgs);

	return (
		<ListHeaderTabs>
			<Tabs value={value} onValueChange={(val) => setValue(val)} className="flex-1">
				{Triggers(values)}
				{values.map((val) => Content(val, query))}
			</Tabs>
		</ListHeaderTabs>
	);
};

const Triggers = (values: string[]) => {
	return (
		<TabsList className="flex-row flex bg-transparent">
			{values.map((value) => (
				<TabsTrigger value={value} className="flex-1 shadow-none" key={`${value}-trigger`}>
					<Text className="">{value.charAt(0).toUpperCase() + value.slice(1)}</Text>
				</TabsTrigger>
			))}
			<BlurView intensity={30} experimentalBlurMethod="dimezisBlurView" />
		</TabsList>
	);
};

const Content = (value: string, query) => {
	const renderItem: ListRenderItem<(typeof query.data)[0]> = ({ item }) => <PostCard key={item.postId} {...item} />;
	return (
		<TabsContent key={`${value}-content`} value={value} className="flex-1">
			<CustomFlatList data={query} renderItem={renderItem} />
		</TabsContent>
	);
};
