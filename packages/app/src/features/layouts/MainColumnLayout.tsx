import { useLayoutEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { Sidebar } from "../sidebar/Sidebar";

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
