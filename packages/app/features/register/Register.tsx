import { Button } from "@vittles/ui/src/components/button/Button";
import { Input } from "@vittles/ui/src/components/input/Input";
import { Label } from "@vittles/ui/src/components/label/Label";
import { Separator } from "@vittles/ui/src/components/separator/Separator";
import { Text } from "@vittles/ui/src/components/text/Text";
import { Link } from "expo-router";

import { handleOAuthSignIn } from "@vittles/app/utils/supabase/actions/actions";
import { handleEmailSignUp } from "@vittles/app/utils/supabase/actions/shared";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { SafeAreaView, View } from "react-native";
import * as v from "valibot";

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

	const onSubmit: SubmitHandler<RegisterFormSchema> = (data) => {
		// Submit data here
		console.log(data);
	};

	const blaa = (
		<Controller
			control={control}
			render={({ field: { onChange, onBlur, value } }) => (
				<Input onBlur={onBlur} onChangeText={(value) => onChange(value)} value={value} />
			)}
			name="password1"
			rules={{ required: true }}
		/>
	);

	return (
		<SafeAreaView>
			<View className="flex flex-col mx-auto gap-5 mt-5">
				<Text className="text-center text-3xl font-bold mb-3">Create an account</Text>
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
								secureTextEntry
								aria-errormessage="err-pass1"
							/>
						)}
						name="password1"
						rules={{ required: true }}
					/>
					{errors.password1 && (
						<Text id="err-pass1" className="text-red-600 text-sm">
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
						<Text id="err-pass2" className="text-red-600 text-sm">
							{errors.password2.message}
						</Text>
					)}
				</View>
				<Button onPress={handleSubmit(onSubmit)}>
					<Text>Create</Text>
				</Button>
				<Text>
					Already have an account?{" "}
					<Link href="login">
						<Text className="underline">Login</Text>
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
