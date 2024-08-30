import { Platform, useWindowDimensions } from "react-native";
import { DRAWER, CARDS, SIDEBAR, BREAKPOINTS } from "@vittles/ui";

export function useResponsiveLayout() {
	const { width, height } = useWindowDimensions();
	const isWeb = Platform.OS === "web";

	// Large screen is defined by a width that can accommodate both the main card and the icon-link drawer.
	const isLargeScreen = width > DRAWER.minWidth + CARDS.MAIN.maxWidth;

	// Sidebar is only visible on web and when the screen is large enough.
	const isSidebarVisible = isWeb && width >= BREAKPOINTS.sidebarScreenSize;

	// Determine the drawer type based on screen size and whether it's on the web.
	const drawerType: "permanent" | "slide" = isWeb && isLargeScreen ? "permanent" : "slide";

	// Permanent drawer width determined on sidebar visibility.
	const webDrawerWidth = isSidebarVisible
		? Math.max(width - (CARDS.MAIN.maxWidth + SIDEBAR.maxWidth), DRAWER.minWidth)
		: Math.max((width - CARDS.MAIN.maxWidth) / 2, DRAWER.minWidth);

	// Web drawer is responsive, mobile drawer is 300px wide.
	const drawerWidth = isWeb && isLargeScreen ? webDrawerWidth : 300;

	const mainContentWidth = Math.min(CARDS.MAIN.maxWidth, width);

	return {
		width,
		height,
		isWeb,
		isLargeScreen,
		isSidebarVisible,
		drawerType,
		webDrawerWidth,
		drawerWidth,
		mainContentWidth,
	};
}
