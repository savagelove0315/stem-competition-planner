import {
  isAuthApiError,
  isAuthRetryableFetchError,
} from "@supabase/supabase-js";

export const AUTH_CONNECTIVITY_MESSAGE =
  "Unable to reach Supabase Auth. Please check your internet connection and try again.";
export const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Supabase Auth is temporarily unavailable. Please try again shortly.";
export const AUTH_SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";
export const AUTH_REQUEST_FAILED_MESSAGE =
  "Supabase Auth could not complete the request. Please try again.";
export const AUTH_RECOVERY_REQUEST_HEADER =
  "x-supabase-auth-recovery";

export type AuthErrorQueryCode =
  | "auth_unreachable"
  | "auth_service_unavailable"
  | "session_expired"
  | "auth_request_failed";

export type SupabaseAuthErrorKind =
  | "connectivity"
  | "service_unavailable"
  | "session_expired"
  | "invalid_credentials"
  | "api_error"
  | "unknown";

export function classifySupabaseAuthError(
  error: unknown,
): SupabaseAuthErrorKind {
  if (isAuthRetryableFetchError(error)) {
    return error.status === 0 ? "connectivity" : "service_unavailable";
  }

  if (isAuthApiError(error)) {
    if (error.code === "invalid_credentials") {
      return "invalid_credentials";
    }

    if (
      error.code === "refresh_token_not_found" ||
      error.code === "refresh_token_already_used" ||
      error.code === "session_expired" ||
      error.code === "bad_jwt"
    ) {
      return "session_expired";
    }

    return "api_error";
  }

  return "unknown";
}

export function getSupabaseAuthUserMessage(error: unknown): string {
  switch (classifySupabaseAuthError(error)) {
    case "connectivity":
      return AUTH_CONNECTIVITY_MESSAGE;
    case "service_unavailable":
      return AUTH_SERVICE_UNAVAILABLE_MESSAGE;
    case "session_expired":
      return AUTH_SESSION_EXPIRED_MESSAGE;
    case "invalid_credentials":
      return "Invalid email or password.";
    case "api_error":
      return "Supabase Auth could not complete the request. Please try again.";
    default:
      return "Unable to complete authentication. Please try again.";
  }
}

export function getAuthErrorQueryMessage(value: string | null): string | null {
  switch (value) {
    case "auth_unreachable":
      return AUTH_CONNECTIVITY_MESSAGE;
    case "auth_service_unavailable":
      return AUTH_SERVICE_UNAVAILABLE_MESSAGE;
    case "session_expired":
      return AUTH_SESSION_EXPIRED_MESSAGE;
    case "auth_request_failed":
      return AUTH_REQUEST_FAILED_MESSAGE;
    default:
      return null;
  }
}
