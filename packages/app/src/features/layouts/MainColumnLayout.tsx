import { View, ScrollView } from "react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sidebar } from "../sidebar/Sidebar";
import { useLayoutEffect, useState } from "react";

type MainColumnsLayoutProps = {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
};

export function MainColumnsLayout({ children, sidebar = <Sidebar /> }: MainColumnsLayoutProps) {
	const { drawerType, mainContentWidth } = useResponsiveLayout();
	const [justify, setJustify] = useState("justify-start pt-12");

	useLayoutEffect(() => {
		setJustify(drawerType === "permanent" ? "justify-start pt-12" : "justify-center pt-4");
	}, [drawerType]);

	return (
		<SafeAreaView className={`flex-1 flex-row ${justify}`}>
			<ScrollView
				className={"flex-1 max-w-min pt-10"}
				style={{ minWidth: mainContentWidth }}
				showsVerticalScrollIndicator={false}
			>
				{children}
			</ScrollView>
			<ScrollView className="pt-10" showsVerticalScrollIndicator={false}>
				{sidebar}
			</ScrollView>
		</SafeAreaView>
	);
}
