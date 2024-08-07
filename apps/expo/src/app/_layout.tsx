import "../global.css";
import { Provider } from "@vittles/app/provider";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const loaded = true;
	// TODO Load assets here

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, []);

	if (!loaded) {
		return null;
	}

	return (
		<Provider initialSession={null}>
			<Slot />
		</Provider>
	);
}
