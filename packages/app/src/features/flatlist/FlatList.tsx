import type { TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/dist/shared";
import type { AppRouter } from "@vittles/api";
import type { FlatListProps as RNFlatListProps } from "react-native";
import { LoadingSpinner, Text, Separator } from "@vittles/ui";
import React from "react";
import { FlatList, View } from "react-native";
import type { ListRenderItem, ListRenderItemInfo } from "react-native";
import { match } from "ts-pattern";

type WithReplies<Item extends object> = Item & {
	replies?: WithReplies<Item>[];
};

type FlatListProps<Item extends object> = {
	data: UseTRPCQueryResult<WithReplies<Item>[], TRPCClientErrorLike<AppRouter>>;
	renderItem: ListRenderItem<WithReplies<Item>>;
} & Omit<RNFlatListProps<WithReplies<Item>>, "data">;

export function CustomFlatList<Item extends object>({ data, renderItem, ...props }: FlatListProps<Item>) {
	const customItemRender = ({ index, ...rest }: ListRenderItemInfo<WithReplies<Item>>) => (
		<>{renderItem({ index, ...rest })}</>
	);

	const layout = match(data)
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isFetching: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => (
			<View className="mx-auto mt-4">
				<Text>{data.error?.message}</Text>
			</View>
		))
		.with({ isSuccess: true }, () => {
			let dataToRender = Array.isArray(data.data) ? data.data : [];

			if (
				dataToRender.length > 0 &&
				Object.hasOwn(dataToRender[0], "replies") &&
				Object.hasOwn(dataToRender[0], "depth")
			) {
				dataToRender = flatten(dataToRender[0]);
			}

			return (
				<FlatList
					{...props}
					// ListHeaderComponent={props.ListHeaderComponent ?? Separator}
					// ListFooterComponent={props.ListFooterComponent ?? Separator}
					// ItemSeparatorComponent={props.ItemSeparatorComponent ?? Separator}
					showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
					data={dataToRender}
					renderItem={customItemRender}
					initialNumToRender={props.initialNumToRender ?? 10}
				/>
			);
		})
		.otherwise(() => null);

	return layout;
}

function flatten<Item extends object>(post: WithReplies<Item>) {
	if (!post.replies || post.replies.length === 0) {
		return [{ ...post }];
	}
	const { replies, ...rootPost } = post;
	const flattenedReplies = replies.flatMap((reply) => flatten(reply));

	return [{ ...rootPost }, ...flattenedReplies];
}
