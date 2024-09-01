import { Muted, Text, Button, HoverCard, HoverCardContent, HoverCardTrigger } from "@vittles/ui";
import { View } from "react-native";
import { shortenName, formatCount } from "../../utils/string";
import { Link } from "expo-router";
import { Image } from "expo-image";

type Variants =
	| "cardWithAvatarHover"
	| "cardNoAvatarHover"
	| "cardNoHover"
	| "avatarOnly"
	| "largeCardNoBio"
	| "profileCard";

type Props = {
	username: string;
	displayName: string;
	profilePictureUrl: string;
	follows?: number;
	followedBy?: number;
	bio?: string;
	isOwnProfile?: boolean;
};

const Avatar = ({
	profilePictureUrl,
	size = 40,
	username,
}: { profilePictureUrl: string; size?: number; username: string }) => (
	<Image
		source={{ uri: profilePictureUrl ?? "https://avatars.githubusercontent.com/u/63797719?v=4" }}
		style={{ width: size, height: size, borderRadius: 10000 }}
		alt={`${username}'s avatar`}
	/>
);

const Names = ({
	underline = false,
	asLink = false,
	row = false,
	shorten = false,
	...props
}: {
	displayName: string;
	username: string;
	underline?: boolean;
	asLink?: boolean;
	row?: boolean;
	shorten?: boolean;
}) => {
	const username = shorten ? shortenName(props.username) : props.username;
	const displayName = shorten ? shortenName(props.displayName) : props.displayName;

	const n = (
		<View className={`flex ${row ? "flex-row" : "flex-col"}`}>
			<Text className={`font-bold text-ellipsis ${underline && "hover:underline"}`}>{displayName}</Text>
			<Muted className="text-ellipsis">@{username}</Muted>
		</View>
	);

	return asLink ? (
		<Link href={`${username}`} asChild>
			{n}
		</Link>
	) : (
		n
	);
};

const FollowCounts = ({
	username,
	follows,
	followedBy,
}: {
	username: string;
	follows?: number;
	followedBy?: number;
}) => (
	<View className="flex flex-row gap-2">
		<Link href={`${username}/followers`} asChild>
			<Text className="font-bold hover:underline">
				{formatCount(followedBy)} <Muted>Followers</Muted>
			</Text>
		</Link>
		<Link href={`${username}/following`} asChild>
			<Text className="font-bold hover:underline">
				{formatCount(follows)} <Muted>Following</Muted>
			</Text>
		</Link>
	</View>
);

// The on-hover card with avatar, names, bio, and follow counts.
const UserPreviewCard = (props: Props) => {
	return (
		<View className="flex flex-col gap-3">
			<View className="flex-1 flex-row justify-between">
				<Avatar profilePictureUrl={props.profilePictureUrl} size={80} username={props.username} />
				<Button variant="default" size="sm" className="rounded-full">
					<Text className="font-bold">Follow</Text>
				</Button>
			</View>
			<Names displayName={props.displayName} username={props.username} asLink underline />
			<Text>{props.bio}</Text>
			<FollowCounts username={props.username} follows={props.follows} followedBy={props.followedBy} />
		</View>
	);
};

// Sidebar user cards with avatar, names, hover card.
const CardWithAvatarHover = (props: Props) => (
	<HoverCard>
		<HoverCardTrigger>
			<View className="flex flex-row gap-2 items-center">
				<Avatar profilePictureUrl={props.profilePictureUrl} username={props.username} />
				<Names displayName={props.displayName} username={props.username} underline asLink />
			</View>
		</HoverCardTrigger>
		<HoverCardContent className="w-full max-w-xs">
			<UserPreviewCard {...props} />
		</HoverCardContent>
	</HoverCard>
);

// Feed posts / post replies name hover cards with no avatar.
const CardNoAvatarHover = (props: Props) => (
	<HoverCard>
		<HoverCardTrigger>
			<Names displayName={props.displayName} username={props.username} underline asLink />
		</HoverCardTrigger>
		<HoverCardContent className="w-full max-w-xs">
			<UserPreviewCard {...props} />
		</HoverCardContent>
	</HoverCard>
);

// Drawer navigation sidebar small card.
const CardNoHover = (props: Props) => (
	<View className="flex flex-row gap-2 items-center">
		<Avatar profilePictureUrl={props.profilePictureUrl} username={props.username} />
		<Names displayName={props.displayName} username={props.username} shorten />
	</View>
);

// Drawer navigation slider large card.
const LargeCardNoBio = (props: Props) => (
	<View className="flex flex-col gap-3">
		<Avatar profilePictureUrl={props.profilePictureUrl} size={80} username={props.username} />
		<Names displayName={props.displayName} username={props.username} asLink underline shorten />
		<FollowCounts username={props.username} follows={props.follows} followedBy={props.followedBy} />
	</View>
);

const UserProfileCard = (props: Props) => (
	<View className="max-w-xl w-full flex flex-row gap-2 pb-3 native:pb-4 px-4">
		<Avatar profilePictureUrl={props.profilePictureUrl} size={120} username={props.username} />
		<View className="flex-1 flex-col self-center">
			<Names displayName={props.displayName} username={props.username} />
			<FollowCounts username={props.username} follows={props.follows} followedBy={props.followedBy} />
		</View>
		{props.isOwnProfile === false && (
			<View className="items-center justify-center">
				<Button variant="default" size="sm" className="rounded-full">
					<Text className="font-bold">Follow</Text>
				</Button>
			</View>
		)}
	</View>
);

export function UserCard(props: Props & { variant: Variants }) {
	const variants = {
		cardWithAvatarHover: <CardWithAvatarHover {...props} />,
		cardNoAvatarHover: <CardNoAvatarHover {...props} />,
		cardNoHover: <CardNoHover {...props} />,
		avatarOnly: <Avatar {...props} />,
		largeCardNoBio: <LargeCardNoBio {...props} />,
		profileCard: <UserProfileCard {...props} />,
	};

	return variants[props.variant];
}
