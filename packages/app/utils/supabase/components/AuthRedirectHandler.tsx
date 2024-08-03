import { useAuthRedirect } from "@vittles/app/utils/supabase/hooks/useAuthRedirect";

export const AuthRedirectHandler = () => {
	useAuthRedirect();
	return null;
};
