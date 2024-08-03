import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "./auth";
import { TRPCProvider } from "./trpc";

export function Provider({ children, initialSession }: { children: React.ReactNode; initialSession: Session | null }) {
	return (
		<AuthProvider initialSession={initialSession}>
			<TRPCProvider>{children}</TRPCProvider>
		</AuthProvider>
	);
}
