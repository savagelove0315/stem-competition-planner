import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedSupabaseClient = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireAuthenticatedClient(
  nextPath = "/dashboard",
): Promise<AuthenticatedSupabaseClient> {
  const user = await requireUser(nextPath);
  const supabase = await createSupabaseServerClient();

  return { supabase, user };
}
