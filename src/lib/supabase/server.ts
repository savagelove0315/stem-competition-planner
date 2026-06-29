import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "./env";

export function createSupabaseServerClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
