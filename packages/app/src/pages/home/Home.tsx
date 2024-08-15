import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from "@vittles/ui";
import { MoonStar } from "@vittles/ui";
import { Badge } from "@vittles/ui";
import { StyleSheet, View } from "react-native";
import { trpc } from "../../utils/trpc/trpc";

export const Home = () => {
	return (
		<View className="flex-col gap-4 items-center">
			<Card className="flex">
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>
					<Text>Card Content</Text>
				</CardContent>
				<CardFooter>
					<View className="flex flex-row gap-2">
						<Badge variant="outline" className="bg-green-400 dark:bg-green-500">
							<Text>Vegan</Text>
						</Badge>
						<Badge variant="secondary">
							<Text>Bacon</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
					</View>
				</CardFooter>
			</Card>
			<Card className="">
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>
					<Text>Card Content</Text>
				</CardContent>
				<CardFooter>
					<View className="flex flex-row gap-2">
						<Badge variant="outline">
							<Text>Vegan</Text>
						</Badge>
						<Badge variant="secondary">
							<Text>Bacon</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
					</View>
				</CardFooter>
			</Card>
			<Card className="">
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
				</CardHeader>
				<CardContent>
					<Text>Card Content</Text>
				</CardContent>
				<CardFooter>
					<View className="flex flex-row gap-2">
						<Badge variant="outline">
							<Text>Vegan</Text>
						</Badge>
						<Badge variant="secondary">
							<Text>Bacon</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
						<Badge variant="destructive">
							<Text>Unethical</Text>
						</Badge>
					</View>
				</CardFooter>
			</Card>
		</View>
	);
};
