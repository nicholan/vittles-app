import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./client";

export const supabase = createClient(supabaseUrl as string, supabaseKey as string);
