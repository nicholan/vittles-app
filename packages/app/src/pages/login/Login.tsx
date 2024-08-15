import { Button, Input, Label, Separator, Text } from "@vittles/ui";
import { Link } from "expo-router";
import { View } from "react-native";
import { handleOAuthSignIn } from "../../auth/supabase/actions/actions";
import { handleEmailSignIn } from "../../auth/supabase/actions/shared";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { SafeAreaView } from "react-native";
import * as v from "valibot";

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
		<SafeAreaView>
			<View className="flex flex-col mx-auto gap-5 mt-5">
				<Text className="text-center text-3xl font-bold mb-3">Welcome back</Text>
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
						<Text id="err-email" className="text-red-600 text-sm">
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
						<Text id="err-pass" className="text-red-600 text-sm">
							{errors.password.message}
						</Text>
					)}
				</View>
				<Button onPress={handleSubmit(onSubmit)}>
					<Text>Continue</Text>
				</Button>
				<Text>
					Don't have an account?{" "}
					<Link href="register">
						<Text className="underline">Register</Text>
					</Link>
				</Text>
				<View className="flex-row items-center justify-center gap-5">
					<Separator className="flex-1" decorative={true} />
					<Text className="text-center uppercase text-sm">or</Text>
					<Separator className="flex-1" decorative={true} />
				</View>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("google")}>
					<Text>Continue with Google</Text>
				</Button>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("apple")}>
					<Text>Continue with Apple</Text>
				</Button>
				<Button variant="secondary" onPress={() => handleOAuthSignIn("github")}>
					<Text>Continue with GitHub</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
};
