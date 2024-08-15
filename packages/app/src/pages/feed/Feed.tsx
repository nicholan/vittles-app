import { Text } from "@vittles/ui";
import { Button, Input } from "@vittles/ui";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { match } from "ts-pattern";
import { useUser } from "../../hooks/useUser";
import { empty, error, loading, success } from "../../utils/trpc/pattern";
import { trpc } from "../../utils/trpc/trpc";

export const Feed = () => {
	const { email } = useUser();
	const currentUser = trpc.user.getCurrentUser.useQuery();
	const { mutate } = trpc.user.createNewUser.useMutation();

	const userLayout = match(currentUser)
		.with(error, () => <Text>{currentUser.failureReason?.message}</Text>)
		.with(loading, () => <Text>Loading...</Text>)
		.with(success, () => <Text>{"No user"}</Text>)
		.otherwise(() => <Text>{currentUser.failureReason?.message}</Text>);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			username: "",
		},
	});

	const onSubmit = async ({ username }) => {
		mutate({ username, email });
	};

	return (
		<View className="flex grow justify-center items-center">
			<View>{userLayout}</View>
			{/* <View>{creationLayout}</View> */}
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						value={value}
						placeholder="Username"
					/>
				)}
				name="username"
				rules={{ required: true }}
			/>
			<Button onPress={handleSubmit(onSubmit)}>
				<Text>Create</Text>
			</Button>
		</View>
	);
};
