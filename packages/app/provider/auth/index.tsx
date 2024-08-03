import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/auth-helpers-react";
import { supabase } from "@vittles/app/utils/supabase/client";
import { AuthRedirectHandler } from "@vittles/app/utils/supabase/components/AuthRedirectHandler";

type AuthProviderProps = {
	children: React.ReactNode;
	initialSession: Session | null;
};

export const AuthProvider = ({ children, initialSession }: AuthProviderProps): React.ReactNode => {
	return (
		<SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
			<AuthRedirectHandler />
			{children}
		</SessionContextProvider>
	);
};
