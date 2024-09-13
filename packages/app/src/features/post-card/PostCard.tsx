import type { ImageDetails } from "@vittles/api";
import { Avatar, AvatarImage, Button, Card, CardContent, CardFooter, CardHeader, Muted, Text } from "@vittles/ui";
import { Heart, MessageSquare, Repeat2, Reply as ReplyIcon } from "@vittles/ui";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";
import { formatCount, timeAgo } from "../../utils/string";
import { trpc } from "../../utils/trpc/trpc";
import { CreatePostModal } from "../post-create/PostCreateModal";
import { UserCard } from "../user-card/UserCard";

type CardProps = {
	content: string;
	createdAt: Date;
	postId: number;
	username: string;
	displayName: string;
	bio: string;
	follows: number;
	followedBy: number;
	files: ImageDetails[];
	profilePictureUrl: string;
	reblogsCount: number;
	commentsCount: number;
	favoritesCount: number;
	rootPostId?: number | null;
	replyToPostId?: number | null;
};

type FooterProps = Pick<
	CardProps,
	| "username"
	| "postId"
	| "commentsCount"
	| "favoritesCount"
	| "reblogsCount"
	| "createdAt"
	| "rootPostId"
	| "replyToPostId"
>;

type ContentProps = Pick<CardProps, "content" | "files" | "postId">;
type HeaderProps = Pick<CardProps, "username" | "displayName" | "profilePictureUrl" | "follows" | "followedBy" | "bio">;

export const PostCard = ({
	content,
	username,
	displayName,
	follows,
	followedBy,
	bio,
	postId,
	createdAt,
	files,
	reblogsCount,
	commentsCount,
	favoritesCount,
	profilePictureUrl,
	rootPostId,
	replyToPostId,
}: CardProps) => {
	return (
		<Card className={"w-full max-w-[576px] rounded-none border-0 shadow-none flex flex-row p-[12px]"}>
			<View className="mr-[8px]">
				<Avatar alt={`${username}'s Avatar`}>
					<AvatarImage
						source={{
							uri: profilePictureUrl ?? "https://avatars.githubusercontent.com/u/63797719?v=4",
						}}
					/>
				</Avatar>
			</View>
			<View className="flex-1">
				<Header
					username={username}
					displayName={displayName}
					profilePictureUrl={profilePictureUrl}
					follows={follows}
					followedBy={followedBy}
					bio={bio}
				/>
				<Content content={content} files={files} postId={postId} />
				<Footer
					username={username}
					postId={postId}
					reblogsCount={reblogsCount}
					favoritesCount={favoritesCount}
					commentsCount={commentsCount}
					createdAt={createdAt}
					rootPostId={rootPostId}
					replyToPostId={replyToPostId}
				/>
			</View>
		</Card>
	);
};

const Content = ({ content, files, postId }: ContentProps) => (
	<Link asChild href={`/post/${postId}`}>
		<CardContent className="p-0 m-0">
			<Text>{content}</Text>
			{files.map((file) => (
				<Image key={file.id} source={{ uri: file.url }} style={{ height: 300, borderRadius: 6 }} />
			))}
		</CardContent>
	</Link>
);

const Header = (props: HeaderProps) => (
	<CardHeader className="p-0 m-0">
		<View className="flex flex-row">
			<UserCard {...props} variant="cardNoAvatarHover" />
		</View>
	</CardHeader>
);

const Footer = ({ postId, commentsCount, favoritesCount, reblogsCount, createdAt, rootPostId }: FooterProps) => {
	const [numComments, setNumComments] = useState(commentsCount);
	const [numFavorites, setNumFavorites] = useState(favoritesCount);
	const [numReblogs, setNumReblogs] = useState(reblogsCount);

	const favorite = trpc.post.toggleFavorite.useMutation({
		onSuccess: async (data) => {
			setNumFavorites(data[0].favorited);
		},
	});

	const cp = (
		<Button variant="ghost" size="sm" className="flex flex-row gap-2 items-center">
			<ReplyIcon size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
		</Button>
	);

	return (
		<CardFooter className="flex flex-row justify-between pb-0 px-0 pt-3 m-0">
			<View className="flex flex-row">
				<CreatePostModal createPostButton={cp} rootPostId={rootPostId} replyToPostId={postId} />
				<Link asChild href={`/post/${postId}`}>
					<Button
						variant="ghost"
						size="sm"
						className="flex flex-row gap-2 items-center"
						disabled={numComments === 0}
					>
						<MessageSquare size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
						<Text>{formatCount(numComments)}</Text>
					</Button>
				</Link>
				<Button variant="ghost" size="sm" className="flex flex-row gap-2 items-center">
					<Heart size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
					<Text>{formatCount(numFavorites)}</Text>
				</Button>
				<Button variant="ghost" size="sm" className="flex flex-row gap-2 items-center">
					<Repeat2 size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
					<Text>{formatCount(numReblogs)}</Text>
				</Button>
			</View>
			<Muted>{timeAgo(createdAt)}</Muted>
		</CardFooter>
	);
};
