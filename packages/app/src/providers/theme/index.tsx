import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider as ThemeProviderOG } from "@react-navigation/native";
import type { Theme } from "@react-navigation/native";
import { NAV_THEME } from "@vittles/ui/src/utils/constants";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance, Platform } from "react-native";

const LIGHT_THEME: Theme = {
	dark: false,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	dark: true,
	colors: NAV_THEME.dark,
};

const getPreferredTheme = async () => {
	let storedTheme: "light" | "dark" | null = null;
	try {
		storedTheme = (await AsyncStorage.getItem("theme")) as "light" | "dark" | null;
	} catch (error) {
		console.log("Error loading theme from storage.");
		storedTheme = null;
	}

	return storedTheme || Appearance.getColorScheme() || "dark";
};

export const ThemeProvider = ({ children }) => {
	const { colorScheme, setColorScheme } = useColorScheme();

	if (Platform.OS === "web") {
		// Adds the background color to the html element to prevent white background on overscroll.
		document.documentElement.classList.add("bg-background");
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Needs to run once.
	useEffect(() => {
		// Load color scheme from async storage, system preference, or 'dark' as fallback.
		(async () => {
			const userTheme = await getPreferredTheme();
			setColorScheme(userTheme);
		})();
	}, []);

	useEffect(() => {
		// Save color scheme change to storage.
		if (colorScheme) {
			AsyncStorage.setItem("theme", colorScheme).catch((_err) => console.log("Error saving theme to storage."));
		}
	}, [colorScheme]);

	return <ThemeProviderOG value={colorScheme === "dark" ? DARK_THEME : LIGHT_THEME}>{children}</ThemeProviderOG>;
};
