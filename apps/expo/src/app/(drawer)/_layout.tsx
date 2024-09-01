import { useState, useLayoutEffect } from "react";
import { SignInSignUp, useSessionContext, useUser, UserCard, useResponsiveLayout } from "@vittles/app";
import { Dropdown, Card, LoadingSpinner, Text, Button } from "@vittles/ui";
import { House, LogOut, Settings, User, Sun, Bell, Mail, Search, Moon } from "@vittles/ui";
import { Drawer } from "expo-router/drawer";
import type { FlexAlignType } from "react-native";
import { View } from "react-native";
import { Link, usePathname } from "expo-router";
import { useColorScheme } from "@vittles/app";
import type { LucideIcon } from "lucide-react-native";
import { match } from "ts-pattern";

export default function DrawerLayout() {
	const { session, isLoading } = useSessionContext();
	const { drawerType, drawerWidth, isWeb, width, height } = useResponsiveLayout();
	const pathname = usePathname();
	const user = useUser();

	const [drawerStyle, setDrawerStyle] = useState({
		drawerType: drawerType,
		width: drawerWidth,
		flex: isWeb && width >= 1280 ? 0.5 : undefined,
		alignItems: drawerType === "slide" ? "flex-start" : "flex-end",
	});

	useLayoutEffect(() => {
		setDrawerStyle({
			drawerType: drawerType,
			width: drawerWidth,
			flex: isWeb && width >= 1280 ? 0.5 : undefined,
			alignItems: drawerType === "slide" ? "flex-start" : "flex-end",
		});
	}, [drawerType, drawerWidth, isWeb, width]);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!session?.user) {
		return <SignInSignUp />;
	}

	const layout = match(user)
		.with({ isLoading: true }, () => <LoadingSpinner />)
		.with({ isError: true }, () => <SignInSignUp />)
		.with({ isSuccess: true }, () => {
			return (
				<Drawer
					screenOptions={() => ({
						drawerType: drawerStyle.drawerType,
						drawerStyle: {
							height,
							width: drawerStyle.width,
							flex: drawerStyle.flex,
							alignItems:
								drawerType === "slide"
									? ("flex-start" as FlexAlignType)
									: ("flex-end" as FlexAlignType),
							borderRightWidth: 0,
						},
						headerShown: isWeb && drawerType === "slide",
						header: ({ navigation }) => {
							return (
								<View className="flex-1 items-center border-b border-secondary py-1">
									<Button
										variant="ghost"
										size="icon"
										onPress={navigation.toggleDrawer}
										className="rounded-full"
									>
										<Text className="text-xl leading-none">&#120124;</Text>
									</Button>
								</View>
							);
						},
					})}
					drawerContent={({ navigation }) => {
						return (
							<View className="flex-1 py-10 native:py-12 px-4">
								<View className="flex-1 flex-col gap-4 items-start">
									{drawerType === "slide" && <UserCard variant="largeCardNoBio" {...user.data} />}
									<NavItem
										href="/"
										icon={House}
										label="Home"
										isActive={pathname === "/"}
										showLabel={drawerType === "slide" || width >= 1280}
									/>
									<NavItem
										href="/explore"
										icon={Search}
										label="Explore"
										isActive={pathname === "/explore"}
										showLabel={drawerType === "slide" || width >= 1280}
									/>
									<NavItem
										href={`${user?.data?.username}`}
										icon={User}
										label="Profile"
										isActive={pathname === `/${user?.data?.username}`}
										showLabel={drawerType === "slide" || width >= 1280}
									/>
									<NavItem
										href="/notifications"
										icon={Bell}
										label="Notifications"
										isActive={pathname === "/notifications"}
										showLabel={drawerType === "slide" || width >= 1280}
									/>
									<NavItem
										href="/messages"
										icon={Mail}
										label="Messages"
										isActive={pathname === "/messages"}
										showLabel={drawerType === "slide" || width >= 1280}
									/>
								</View>
								<View className="flex w-full items-start">
									<EndContainer width={width} drawerType={drawerType} pathname={pathname}>
										<UserCard
											{...user.data}
											variant={width >= 1280 ? "cardNoHover" : "avatarOnly"}
										/>
									</EndContainer>
								</View>
							</View>
						);
					}}
				/>
			);
		})
		.otherwise(() => null);

	return layout;
}

type NavItemProps = {
	href?: string;
	icon: LucideIcon;
	label: string;
	showLabel: boolean;
	isActive?: boolean;
	onPress?: () => void;
};

function NavItem({ href, icon: Icon, label, isActive, onPress, showLabel }: NavItemProps) {
	const content = (
		<Button variant={isActive ? "secondary" : "ghost"} onPress={onPress} size={showLabel ? "default" : "icon"}>
			<View className="flex-1 flex-row items-center gap-6">
				<Icon size={25} className="text-accent-foreground" />
				{showLabel && <Text className="text-lg select-none">{label}</Text>}
			</View>
		</Button>
	);

	return href ? (
		<Link href={href} asChild>
			{content}
		</Link>
	) : (
		content
	);
}

type EndContainerProps = {
	drawerType: string;
	width: number;
	children?: React.ReactNode;
	pathname: string;
};

function EndContainer({ drawerType, width, children, pathname }: EndContainerProps) {
	const { colorScheme, toggleColorScheme } = useColorScheme();

	const withDropdown = (
		<Dropdown.Root>
			<Dropdown.Trigger>{children}</Dropdown.Trigger>
			<Dropdown.Portal>
				<Dropdown.Overlay>
					<Dropdown.Content sideOffset={10}>
						<Card className="p-2 flex-1 flex-col gap-4 items-start">
							<Dropdown.Item>
								<NavItem
									showLabel={drawerType === "slide" || width >= 1280}
									icon={colorScheme === "light" ? Sun : Moon}
									label="Theme"
									onPress={toggleColorScheme}
								/>
							</Dropdown.Item>
							<Dropdown.Item>
								<NavItem
									showLabel={drawerType === "slide" || width >= 1280}
									href="/logout"
									icon={LogOut}
									label="Logout"
								/>
							</Dropdown.Item>
							<Dropdown.Item>
								<NavItem
									showLabel={drawerType === "slide" || width >= 1280}
									href="/settings"
									icon={Settings}
									label="Settings"
								/>
							</Dropdown.Item>
						</Card>
					</Dropdown.Content>
				</Dropdown.Overlay>
			</Dropdown.Portal>
		</Dropdown.Root>
	);

	const withoutDropdown = (
		<View className="flex-1 flex-col gap-4 items-start">
			<NavItem
				showLabel={drawerType === "slide" || width >= 1280}
				icon={colorScheme === "light" ? Sun : Moon}
				label="Theme"
				onPress={toggleColorScheme}
			/>
			<NavItem showLabel={drawerType === "slide" || width >= 1280} href="/logout" icon={LogOut} label="Logout" />
			<NavItem
				showLabel={drawerType === "slide" || width >= 1280}
				href="/settings"
				icon={Settings}
				label="Settings"
				isActive={pathname === "/settings"}
			/>
		</View>
	);

	return drawerType === "slide" ? withoutDropdown : withDropdown;
}
