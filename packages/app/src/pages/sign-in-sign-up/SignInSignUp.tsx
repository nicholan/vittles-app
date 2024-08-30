import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vittles/ui";
import { Text } from "@vittles/ui";
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Login } from "../../features/login/Login";
import { Register } from "../../features/register/Register";

export const SignInSignUp = () => {
	const [value, setValue] = React.useState("login");
	return (
		<SafeAreaView className="flex-1 p-6 mt-4">
			<Tabs value={value} onValueChange={setValue} className="w-full max-w-md mx-auto flex-col gap-1.5">
				<TabsList className="flex-row w-full">
					<TabsTrigger value="login" className="flex-1">
						<Text>Login</Text>
					</TabsTrigger>
					<TabsTrigger value="register" className="flex-1">
						<Text>Register</Text>
					</TabsTrigger>
				</TabsList>
				<TabsContent value="login">
					<Login />
				</TabsContent>
				<TabsContent value="register">
					<Register />
				</TabsContent>
			</Tabs>
		</SafeAreaView>
	);
};
