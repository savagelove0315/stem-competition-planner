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

function getLoginRedirectPath(
  nextPath: string,
  authError?: "auth_unreachable",
): string {
  const params = new URLSearchParams({
    next: getSafeNextPath(nextPath),
  });

  if (authError) {
    params.set("authError", authError);
  }

  return `/login?${params.toString()}`;
}

function getAuthErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown auth error";
}

function isAuthConnectivityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AuthRetryableFetchError" ||
    error.message.toLowerCase() === "fetch failed"
  );
}

export async function requireUser(nextPath = "/dashboard"): Promise<User> {
  const supabase = await createSupabaseServerClient();
  let user: User | null = null;
  let error: unknown = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    error = result.error;
  } catch (getUserError) {
    error = getUserError;
  }

  if (error && !(error instanceof Error && error.name === "AuthSessionMissingError")) {
    if (isAuthConnectivityError(error)) {
      redirect(getLoginRedirectPath(nextPath, "auth_unreachable"));
    }

    throw new Error(`Unable to verify the authenticated user: ${getAuthErrorMessage(error)}`);
  }

  if (!user) {
    redirect(getLoginRedirectPath(nextPath));
  }

  return user;
}
