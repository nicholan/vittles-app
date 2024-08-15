import { SafeAreaProvider as SafeAreaProviderOg, initialWindowMetrics } from "react-native-safe-area-context";

export const SafeAreaProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
	return <SafeAreaProviderOg initialMetrics={initialWindowMetrics}>{children}</SafeAreaProviderOg>;
};
