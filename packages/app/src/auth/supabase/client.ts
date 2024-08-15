import { createClient } from "@supabase/supabase-js";
import { LargeSecureStore } from "./storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl as string, supabaseKey as string, {
	auth: {
		storage: new LargeSecureStore(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		flowType: "pkce",
	},
});
