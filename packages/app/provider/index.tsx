import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "./auth";
import { TRPCProvider } from "./trpc";
import { SafeAreaProvider } from "./safe-area";

export function Provider({ children, initialSession }: { children: React.ReactNode; initialSession: Session | null }) {
	return (
		<SafeAreaProvider>
			<AuthProvider initialSession={initialSession}>
				<TRPCProvider>{children}</TRPCProvider>
			</AuthProvider>
		</SafeAreaProvider>
	);
}
