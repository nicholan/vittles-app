import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Provider } from "@vittles/app/src/providers";
import { Slot, SplashScreen } from "expo-router";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
	const loaded = true;
	// TODO Load assets here

	if (!loaded) {
		return null;
	}

	return (
		<Provider initialSession={null}>
			<Slot />
			<PortalHost />
		</Provider>
	);
}
