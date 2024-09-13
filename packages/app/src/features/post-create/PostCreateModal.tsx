import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Muted } from "@vittles/ui";
import { NewPost } from "./PostCreateForm";

type PostProps = {
	rootPostId?: number;
	replyToPostId?: number;
	createPostButton?: JSX.Element;
};

export const CreatePostModal = ({ rootPostId = null, replyToPostId = null, createPostButton }: PostProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{createPostButton}</DialogTrigger>
			<DialogContent>
				<DialogHeader className="py-4">
					<DialogTitle className={"flex-1 flex-col"}>
						{/* <CurrentUserCard queryType="current" /> */}
						{/* <Muted>{replyToHandle ? `@${replyToHandle}` : "Create Post"}</Muted> */}
					</DialogTitle>
					<DialogDescription className={"flex-1"}>
						<NewPost rootPostId={rootPostId} replyToPostId={replyToPostId} />
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};
