import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button, Card, H3, Input, Label, Separator, Text } from "@vittles/ui";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { View } from "react-native";
import * as v from "valibot";
import { handleOAuthSignIn } from "../../auth/supabase/actions/actions";
import { handleEmailSignUp } from "../../auth/supabase/actions/shared";

type RegisterFormSchema = v.InferInput<typeof RegisterSchema>;

const RegisterSchema = v.pipe(
	v.object({
		email: v.pipe(v.string(), v.nonEmpty("Please enter your email."), v.email("Please enter a valid email.")),
		password1: v.pipe(
			v.string(),
			v.nonEmpty("Please create a password."),
			v.minLength(8, "Your password must have 8 characters or more."),
		),
		password2: v.string(),
	}),
	v.forward(
		v.partialCheck(
			[["password1"], ["password2"]],
			(input) => input.password1 === input.password2,
			"Passwords do not match.",
		),
		["password2"],
	),
);

export const Register = (): React.ReactNode => {
	const { supabaseClient } = useSessionContext();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormSchema>({
		defaultValues: {
			email: "",
			password1: "",
			password2: "",
		},
		resolver: valibotResolver(RegisterSchema),
	});

	const onSubmit: SubmitHandler<RegisterFormSchema> = async ({ email, password1 }) => {
		// await handleEmailSignUp(email, password1);
		console.log({ email, password1 });
	};

	return (
		<View className="flex-1 items-center justify-center">
			<Card className="flex flex-col mx-auto gap-5 p-8 w-full max-w-md">
				<H3 className={"text-center"}>Create an account</H3>
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
						rules={{ required: true }}
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
								secureTextEntry
								aria-errormessage="err-pass1"
							/>
						)}
						name="password1"
						rules={{ required: true }}
					/>
					{errors.password1 && (
						<Text id="err-pass1" className="text-red-500 text-sm">
							{errors.password1.message}
						</Text>
					)}
				</View>
				<View className="flex flex-col gap-1">
					<Label nativeID="confirm_password">Confirm password:</Label>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								onBlur={onBlur}
								onChangeText={(value) => onChange(value)}
								value={value}
								placeholder="Confirm password"
								secureTextEntry
								aria-errormessage="err-pass2"
							/>
						)}
						name="password2"
						rules={{ required: true }}
					/>
					{errors.password2 && (
						<Text id="err-pass2" className="text-red-500 text-sm">
							{errors.password2.message}
						</Text>
					)}
				</View>
				<Button onPress={handleSubmit(onSubmit)}>
					<Text>Create</Text>
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
