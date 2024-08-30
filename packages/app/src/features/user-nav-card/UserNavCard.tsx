import { Avatar, AvatarImage, Muted, Text, Button } from "@vittles/ui";
import { View } from "react-native";
import { shortenName } from "../../utils/string";
import { Link } from "expo-router";

type PostProps = {
	username: string;
	displayName: string;
	profilePictureUrl: string;
	showDetails?: boolean;
	follows: number;
	followedBy: number;
	asFullCard?: boolean;
};

export function UserNavCard({
	username,
	profilePictureUrl,
	displayName,
	follows,
	followedBy,
	showDetails = true,
	asFullCard = false,
}: PostProps) {
	const avatar = (
		<Avatar alt={`${username}'s Avatar`}>
			<AvatarImage
				source={{
					uri: profilePictureUrl ?? "https://avatars.githubusercontent.com/u/63797719?v=4",
				}}
			/>
		</Avatar>
	);

	const names = (
		<View className="flex flex-col">
			<Text className="font-bold">{shortenName(displayName)}</Text>
			<Muted>@{shortenName(username)}</Muted>
		</View>
	);

	const followCounts = (
		<View className="flex flex-row gap-2">
			<Link href={`${username}/followers`}>
				<Text>
					{followedBy} <Muted>Followers</Muted>
				</Text>
			</Link>
			<Link href={`${username}/following`}>
				<Text>
					{follows} <Muted>Following</Muted>
				</Text>
			</Link>
		</View>
	);

	const asfullCard = (
		<View className="flex flex-col gap-2 px-4 py-2 native:px-5 native:py-3">
			{avatar}
			{names}
			{followCounts}
		</View>
	);

	const asButton = (
		<Button
			variant="ghost"
			size={showDetails ? "default" : "icon"}
			className={`items-start ${showDetails === false && "rounded-full"}`}
		>
			<View className="flex flex-row gap-2 items-center">
				{avatar}
				{showDetails && names}
			</View>
		</Button>
	);

	return asFullCard ? asfullCard : asButton;
}
