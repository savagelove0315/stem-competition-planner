import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import {
  AUTH_RECOVERY_REQUEST_HEADER,
  classifySupabaseAuthError,
} from "@/lib/auth/errors";
import { getLoginRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    const errorKind = classifySupabaseAuthError(error);

    if (errorKind === "connectivity") {
      redirect(getLoginRedirectPath(nextPath, "auth_unreachable"));
    }

    if (errorKind === "service_unavailable") {
      redirect(getLoginRedirectPath(nextPath, "auth_service_unavailable"));
    }

    if (errorKind === "session_expired") {
      redirect(getLoginRedirectPath(nextPath, "session_expired"));
    }

    if (errorKind === "api_error") {
      redirect(getLoginRedirectPath(nextPath, "auth_request_failed"));
    }

    throw new Error("Unable to verify the authenticated user.");
  }

  if (!user) {
    const authRecovery = (await headers()).get(AUTH_RECOVERY_REQUEST_HEADER);
    redirect(
      getLoginRedirectPath(
        nextPath,
        authRecovery === "session_expired" ? "session_expired" : undefined,
      ),
    );
  }

  return user;
}
