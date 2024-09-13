import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Muted, Text } from "@vittles/ui";
import { ScrollView, View } from "react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { UserCard } from "../user-card/UserCard";

const card = (
	<Card>
		<CardHeader>
			<CardTitle>Subscribe</CardTitle>
		</CardHeader>
		<CardContent>
			<Text>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veniam voluptatibus quas cumque qui. Voluptate
				ut magnam quasi quas cupiditate explicabo dicta animi rerum, exercitationem, doloremque esse libero
				similique, velit eligendi?
			</Text>
		</CardContent>
	</Card>
);

export const Sidebar = () => {
	const { isSidebarVisible } = useResponsiveLayout();

	if (isSidebarVisible) {
		return (
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="flex-1 max-w-sm mx-[12px] flex-col gap-3">
					<Card className="shadow-none border-l-4 rounded-none border-t-0 border-b-0 border-r-0">
						<CardHeader>
							<CardTitle>Subscribe to Premium</CardTitle>
						</CardHeader>
						<CardContent>
							<Text>
								Unlock exclusive features and take your experience to the next level. No ads, more
								customization, and early access to new features.
							</Text>
						</CardContent>
						<CardFooter>
							<Button className="rounded-full">
								<Text className="font-bold">Upgrade Now</Text>
							</Button>
						</CardFooter>
					</Card>

					<Card className="shadow-none border-l-4 rounded-none border-t-0 border-b-0 border-r-0">
						<CardHeader>
							<CardTitle>Trends for you</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 flex-col gap-3">
							<Text>#BreakingNews: Major tech company announces new product release.</Text>
							<Text>
								#MondayMotivation: "The future belongs to those who believe in the beauty of their
								dreams." - Eleanor Roosevelt
							</Text>
							<Text>
								#TechTalk: Latest advancements in AI are set to revolutionize industries worldwide.
							</Text>
						</CardContent>
						<CardFooter>
							<Muted className="hover:underline">Show more</Muted>
						</CardFooter>
					</Card>

					<Card className="shadow-none border-l-4 rounded-none border-t-0 border-b-0 border-r-0">
						<CardHeader>
							<CardTitle>Who to follow</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 flex-col gap-3">
							<View className="flex-1 justify-between flex-row">
								<UserCard
									username="duck_lord1"
									displayName="AwesomeDuckLord"
									profilePictureUrl={null}
									bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit."
									variant="cardWithAvatarHover"
									followedBy={1948841}
									follows={15703212}
								/>
								<Button variant="default" size="sm" className="rounded-full">
									<Text className="font-bold">Follow</Text>
								</Button>
							</View>
							<View className="flex-1 justify-between flex-row">
								<UserCard
									username="duck_lord1"
									displayName="AwesomeDuckLord"
									profilePictureUrl={null}
									bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit."
									variant="cardWithAvatarHover"
									followedBy={1948841}
									follows={15703212}
								/>
								<Button variant="default" size="sm" className="rounded-full">
									<Text className="font-bold">Follow</Text>
								</Button>
							</View>
							<View className="flex-1 justify-between flex-row">
								<UserCard
									username="duck_lord1"
									displayName="AwesomeDuckLord"
									profilePictureUrl={null}
									bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit."
									variant="cardWithAvatarHover"
									followedBy={1948841}
									follows={15703212}
								/>
								<Button variant="default" size="sm" className="rounded-full">
									<Text className="font-bold">Follow</Text>
								</Button>
							</View>
							<View className="flex-1 justify-between flex-row">
								<UserCard
									username="duck_lord1"
									displayName="AwesomeDuckLord"
									profilePictureUrl={null}
									bio="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit.Lorem ipsum dolor sit amet, consectetur adipisicing elit."
									variant="cardWithAvatarHover"
									followedBy={1948841}
									follows={15703212}
								/>
								<Button variant="default" size="sm" className="rounded-full">
									<Text className="font-bold">Follow</Text>
								</Button>
							</View>
						</CardContent>
						<CardFooter>
							<Muted className="hover:underline">Show more</Muted>
						</CardFooter>
					</Card>
				</View>
			</ScrollView>
		);
	}
	return null;
};
