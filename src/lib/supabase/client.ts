"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey);
}
