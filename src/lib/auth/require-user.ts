import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(nextPath: string): string {
  if (
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\")
  ) {
    return "/dashboard";
  }

  return nextPath;
}

export async function requireUser(nextPath = "/dashboard"): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error(`Unable to verify the authenticated user: ${error.message}`);
  }

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(getSafeNextPath(nextPath))}`);
  }

  return user;
}
