import { ScrollView, FlatList } from "react-native";
import type { ListRenderItem } from "react-native";
import { match } from "ts-pattern";
import { MainColumnsLayout } from "../../features/layouts/MainColumnLayout";
import { trpc } from "../../utils/trpc/trpc";
import { Card, Text, Muted, LoadingSpinner } from "@vittles/ui";
import type { AppRouter } from "@vittles/api";
import type { inferProcedureOutput } from "@trpc/server";
import { Link } from "expo-router";
import { UserCard } from "../../features/user-card/UserCard";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";

type NotificationsQuery = inferProcedureOutput<AppRouter["notification"]["getNotifications"]>;
type UserQuery = inferProcedureOutput<AppRouter["user"]["getCurrentUser"]>;

type NotificationItemProps = {
	userCardProps: NotificationsQuery[number];
	text: string;
	linkText: string;
	linkHref: string;
};

const NotificationItem = ({ userCardProps, text, linkText, linkHref }: NotificationItemProps) => {
	return (
		<Card>
			<UserCard {...userCardProps} variant="notificationUserCard" />
			<Text>
				{text}{" "}
				<Link href={linkHref} asChild>
					<Text>{linkText}</Text>
				</Link>
				.
			</Text>
		</Card>
	);
};

const notificationTypeDispatchTable: Record<
	string,
	(props: NotificationsQuery[number], currentUser?: UserQuery) => JSX.Element
> = {
	like: (props, currentUser) => (
		<NotificationItem
			userCardProps={props}
			text="liked your"
			linkText="post"
			linkHref={`${currentUser?.username}/status/${props.postId}`}
		/>
	),
	reblog: (props) => (
		<NotificationItem
			userCardProps={props}
			text="reblogged your"
			linkText="post"
			linkHref={`${props.username}/status/${props.postId}`}
		/>
	),
	follow: (props) => <NotificationItem userCardProps={props} text="followed you" linkText="" linkHref="" />,
	mention: (props) => (
		<NotificationItem
			userCardProps={props}
			text="mentioned you in their"
			linkText="post"
			linkHref={`${props.username}/status/${props.postId}`}
		/>
	),
	reply: (props, currentUser) => (
		<NotificationItem
			userCardProps={props}
			text="replied to your"
			linkText="post"
			linkHref={`${currentUser?.username}/status/${props.postId}`}
		/>
	),
	quote: (props) => (
		<NotificationItem
			userCardProps={props}
			text="quoted your"
			linkText="post"
			linkHref={`${props.username}/status/${props.postId}`}
		/>
	),
};

export const Notifications = () => {
	const notificationsQuery = trpc.notification.getNotifications.useQuery();
	const [currentUser, setCurrentUser] = useState<UserQuery>(null);

	const renderItem: ListRenderItem<NotificationsQuery[number]> = ({ item }) => {
		return notificationTypeDispatchTable[item.type](item, currentUser);
	};

	match(useUser())
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			setCurrentUser(data);
		})
		.otherwise(() => null);

	const layout = match(notificationsQuery)
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data }) => {
			return <FlatList renderItem={renderItem} data={data} />;
		})
		.otherwise(() => null);

	return (
		<MainColumnsLayout>
			<ScrollView showsVerticalScrollIndicator={false}>{layout}</ScrollView>
		</MainColumnsLayout>
	);
};
