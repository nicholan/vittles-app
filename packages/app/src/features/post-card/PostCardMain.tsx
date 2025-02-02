import type { ImageDetails } from "@vittles/api";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Muted,
	Separator,
	Text,
} from "@vittles/ui";
import { Heart, MessageSquare, Repeat2, Reply as ReplyIcon, Share } from "@vittles/ui";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { formatCount } from "../../utils/string";
import { formatDate } from "../../utils/string";
import { trpc } from "../../utils/trpc/trpc";
import { NewPost } from "../post-create/PostCreateForm";

type CardProps = {
	content: string;
	createdAt: Date;
	postId: number;
	username: string;
	displayName: string;
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
type HeaderProps = Pick<CardProps, "username" | "displayName" | "profilePictureUrl">;

export const PostCardMain = ({
	content,
	username,
	displayName,
	postId,
	createdAt,
	files,
	reblogsCount,
	commentsCount,
	favoritesCount,
	profilePictureUrl,
	rootPostId,
}: CardProps) => {
	return (
		<Card className={"w-full max-w-[576px] rounded-none border-0 px-[12px]"}>
			<Header username={username} displayName={displayName} profilePictureUrl={profilePictureUrl} />
			<Content content={content} files={files} postId={postId} />
			<Footer
				username={username}
				postId={postId}
				reblogsCount={reblogsCount}
				favoritesCount={favoritesCount}
				commentsCount={commentsCount}
				createdAt={createdAt}
				rootPostId={rootPostId}
				replyToPostId={postId}
			/>
		</Card>
	);
};

const Content = ({ content, files, postId }: ContentProps) => (
	<CardContent className="px-0">
		<Text>{content}</Text>
		{files.map((file) => (
			<Image key={file.id} source={{ uri: file.url }} style={{ height: 300, borderRadius: 6 }} />
		))}
	</CardContent>
);

const Header = ({ username, displayName, profilePictureUrl }: HeaderProps) => (
	<CardHeader className="p-0 m-0">
		<View className="flex-1 flex-row">
			<View className="mr-[8px]">
				<Avatar alt={`${username}'s Avatar`}>
					<AvatarImage
						source={{
							uri: profilePictureUrl ?? "https://avatars.githubusercontent.com/u/63797719?v=4",
						}}
					/>
				</Avatar>
			</View>
			<View className="flex-1 flex-col">
				<Text className="font-bold leading-tight">{displayName}</Text>
				<Link href={`/${username}`} asChild>
					<Pressable>
						<Muted>@{username}</Muted>
					</Pressable>
				</Link>
			</View>
		</View>
	</CardHeader>
);

const Footer = ({
	postId,
	commentsCount,
	favoritesCount,
	reblogsCount,
	createdAt,
	rootPostId,
	username,
}: FooterProps) => {
	const [numComments, setNumComments] = useState(commentsCount);
	const [numFavorites, setNumFavorites] = useState(favoritesCount);
	const [numReblogs, setNumReblogs] = useState(reblogsCount);

	const favorite = trpc.post.toggleFavorite.useMutation({
		onSuccess: async (data) => {
			setNumFavorites(data[0].favorited);
		},
	});

	return (
		<CardFooter className="flex flex-col p-0">
			<View className="mb-2 self-start">
				<Muted className="">{formatDate(createdAt)}</Muted>
			</View>
			<Separator decorative />
			<View className="flex w-full flex-row justify-between py-1">
				<Button
					variant="ghost"
					size="sm"
					className="flex flex-row gap-1.5 items-center"
					disabled={numComments === 0}
				>
					<MessageSquare size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
					<Text>{formatCount(numComments)}</Text>
				</Button>
				<Button variant="ghost" size="sm" className="flex flex-row gap-1.5 items-center">
					<Heart size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
					<Text>{formatCount(numFavorites)}</Text>
				</Button>
				<Button variant="ghost" size="sm" className="flex flex-row gap-1.5 items-center">
					<Repeat2 size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
					<Text>{formatCount(numReblogs)}</Text>
				</Button>
				<Button variant="ghost" size="sm" className="flex flex-row gap-1.5 items-center">
					<Share size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
				</Button>
			</View>
			<Separator decorative />
			<View className="w-full py-2">
				<Muted className="flex items-center pb-2">
					Replying to{" "}
					<Link href={`/${username}`}>
						<Muted className="font-bold">@{username}</Muted>
					</Link>
				</Muted>
				<NewPost
					submitButtonText="Reply"
					placeHolderText="Post your reply"
					rootPostId={rootPostId ? rootPostId : postId}
					replyToPostId={postId}
				/>
			</View>
		</CardFooter>
	);
};
