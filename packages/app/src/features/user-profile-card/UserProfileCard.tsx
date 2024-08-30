import { Muted, Text } from "@vittles/ui";
import { Image } from "expo-image";
import { View, Platform } from "react-native";
import { match } from "ts-pattern";
import { trpc } from "../../utils/trpc/trpc";
import { Link } from "expo-router";

const queryDispatchTable = {
	current: () => trpc.user.getCurrentUser.useQuery(),
	byUsername: (username: string) => trpc.user.getUserByUsername.useQuery({ username }),
};

type QueryType = keyof typeof queryDispatchTable;

type PostProps = {
	queryType?: QueryType;
	username?: string;
};

export function UserProfileCard({ queryType = "byUsername", username }: PostProps) {
	const queryResult = queryDispatchTable[queryType](username);

	const layout = match(queryResult)
		.with({ isLoading: true }, () => null)
		.with({ isError: true }, () => null)
		.with({ isSuccess: true }, ({ data: { displayName, username, profilePictureUrl, ...rest } }) => {
			return (
				<View className="max-w-xl w-full flex flex-row gap-2 pt-10 pb-3 native:pt-12 native:pb-4 px-4">
					<Image
						source={{ uri: "https://avatars.githubusercontent.com/u/63797719?v=4" }}
						style={{ width: 150, height: 150, margin: 3, borderRadius: 10000 }}
					/>
					<View className="flex-1 flex-col self-center">
						<Text className="font-bold">{displayName}</Text>
						<Muted>@{username}</Muted>
						<View className="flex flex-row gap-2">
							<Link href={`${username}/followers`}>
								<Text>
									{rest.followedBy} <Muted>Followers</Muted>
								</Text>
							</Link>
							<Link href={`${username}/following`}>
								<Text>
									{rest.follows} <Muted>Following</Muted>
								</Text>
							</Link>
						</View>
					</View>
				</View>
			);
		})
		.otherwise(() => null);

	return layout;
}
