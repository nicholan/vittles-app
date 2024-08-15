import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
	Text,
} from "@vittles/ui";

import { View } from "react-native";

export const Browse = () => {
	return (
		<View className="flex items-center justify-center mt-4">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" className="w-min">
						<Text>Edit Profile</Text>
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button>
								<Text>OK</Text>
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</View>
	);
};
