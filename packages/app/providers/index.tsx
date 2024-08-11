import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "./auth";
import { SafeAreaProvider } from "./safe-area";
import { ThemeProvider } from "./theme";
import { TRPCProvider } from "./trpc";

export function Provider({ children, initialSession }: { children: React.ReactNode; initialSession: Session | null }) {
	return (
		<ThemeProvider>
			<SafeAreaProvider>
				<AuthProvider initialSession={initialSession}>
					<TRPCProvider>{children}</TRPCProvider>
				</AuthProvider>
			</SafeAreaProvider>
		</ThemeProvider>
	);
}
