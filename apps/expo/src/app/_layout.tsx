import "../global.css";
import { Provider } from "@vittles/app/provider";
import { Slot } from "expo-router";

// Providers on root layout.
export default function RootLayout() {
	return (
		<Provider initialSession={null}>
			<Slot />
		</Provider>
	);
}
