import type { AuthErrorQueryCode } from "./errors";

export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export function getSafeAuthRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  return value;
}

export function getLoginRedirectPath(
  nextPath: string,
  authError?: AuthErrorQueryCode,
): string {
  const params = new URLSearchParams({
    next: getSafeAuthRedirectPath(nextPath),
  });

  if (authError) {
    params.set("authError", authError);
  }

  return `/login?${params.toString()}`;
}
