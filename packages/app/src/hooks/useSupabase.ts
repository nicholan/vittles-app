import { supabase } from "../auth/supabase/client";

export const useSupabase = () => {
	return supabase;
};
