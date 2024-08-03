import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "dotenv/config";

export const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

export const ExpoSecureStoreAdapter = {
	getItem: (key: string) => SecureStore.getItemAsync(key),
	setItem: (key: string, value: string) => SecureStore.setItem(key, value),
	removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl as string, supabaseKey as string, {
	auth: {
		storage: ExpoSecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		flowType: "pkce",
	},
});
