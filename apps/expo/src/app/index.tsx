import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button as TestButton } from "@vittles/ui/src/button";

export default function Page() {
	return (
		<View className="flex flex-1 bg-white dark:bg-black">
			<Header />
			<Content />
			<Footer />
		</View>
	);
}

function Content() {
	return (
		<View className="flex-1">
			<View className="py-12 md:py-24 lg:py-32 xl:py-48">
				<View className="px-4 md:px-6">
					<View className="flex flex-col items-center gap-4 text-center">
						<Text
							role="heading"
							className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-black dark:text-white"
						>
							Expo project
						</Text>
						<Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
							Fake latin text here wow
						</Text>

						<View className="gap-4">
							<TestButton className="bg-white dark:bg-orange-500 rounded-sm py-1 px-3 border border-black dark:border-white">
								<Text>Custom</Text>
							</TestButton>
							<Link
								suppressHighlighting
								className="flex h-9 items-center justify-center overflow-hidden rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 web:shadow ios:shadow transition-colors hover:bg-gray-900/90 active:bg-gray-400/90 web:focus-visible:outline-none web:focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
								href="/"
							>
								Yass
							</Link>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}

function Header() {
	const { top } = useSafeAreaInsets();
	return (
		<View style={{ paddingTop: top }}>
			<View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between border-b border-y-white/30">
				<Link className="font-bold flex-1 items-center justify-center text-black dark:text-white" href="/">
					Home
				</Link>
				<View className="flex flex-row gap-4 sm:gap-6">
					<Link className="text-md font-medium hover:underline web:underline-offset-4 text-black dark:text-white" href="/">
						About
					</Link>
					<Link className="text-md font-medium hover:underline web:underline-offset-4 text-black dark:text-white" href="/">
						Contact
					</Link>
					<Link className="text-md font-medium hover:underline web:underline-offset-4 text-black dark:text-white" href="/">
						Login
					</Link>
				</View>
			</View>
		</View>
	);
}

function Footer() {
	const { bottom } = useSafeAreaInsets();
	return (
		<View className="flex shrink-0 native:hidden border-t border-y-white/30" style={{ paddingBottom: bottom }}>
			<View className="py-6 flex-1 items-center px-4 md:px-6 ">
				<Text className={"text-center text-black dark:text-white"}>© {new Date().getFullYear()} Nicholas</Text>
			</View>
		</View>
	);
}
