import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button, Card, H3, Input, Label, Large, Lead, Separator, Text } from "@vittles/ui";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { View } from "react-native";
import { SafeAreaView } from "react-native";
import * as v from "valibot";
import { handleOAuthSignIn } from "../../auth/supabase/actions/actions";
import { handleEmailSignIn } from "../../auth/supabase/actions/shared";

type LoginFormSchema = v.InferInput<typeof LoginSchema>;

const LoginSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty("Please enter your email."), v.email("Please enter a valid email.")),
	password: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
});

export const Login = (): React.ReactNode => {
	const { supabaseClient } = useSessionContext();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormSchema>({
		defaultValues: {
			email: "",
			password: "",
		},
		resolver: valibotResolver(LoginSchema),
	});

	const onSubmit: SubmitHandler<LoginFormSchema> = async ({ email, password }) => {
		// await handleEmailSignIn(email, password);
		console.log({ email, password });
	};

	return (
		<View className="flex-1 items-center justify-center">
			<Card className="flex flex-col mx-auto gap-5 p-8 w-full max-w-md">
				<H3 className={"text-center"}>Welcome back</H3>
				<View className="flex flex-col gap-1">
					<Label nativeID="email">Email address:</Label>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								onBlur={onBlur}
								onChangeText={(value) => onChange(value)}
								value={value}
								placeholder="Email"
								aria-errormessage="err-email"
							/>
						)}
						name="email"
					/>
					{errors.email && (
						<Text id="err-email" className="text-red-500 text-sm">
							{errors.email.message}
						</Text>
					)}
				</View>
				<View className="flex flex-col gap-1">
					<Label nativeID="password">Password:</Label>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								onBlur={onBlur}
								onChangeText={(value) => onChange(value)}
								value={value}
								placeholder="Password"
								aria-errormessage="err-pass"
								secureTextEntry
							/>
						)}
						name="password"
					/>
					{errors.password && (
						<Text id="err-pass" className="text-red-500 text-sm">
							{errors.password.message}
						</Text>
					)}
				</View>
				<Button onPress={handleSubmit(onSubmit)}>
					<Text>Continue</Text>
				</Button>
				<View className="flex-row items-center justify-center gap-5">
					<Separator className="flex-1" decorative={true} />
					<Text className="text-center uppercase text-sm">or continue with</Text>
					<Separator className="flex-1" decorative={true} />
				</View>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("google")}>
					<Text>Google</Text>
				</Button>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("apple")}>
					<Text>Apple</Text>
				</Button>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("github")}>
					<Text>GitHub</Text>
				</Button>
			</Card>
		</View>
	);
};
