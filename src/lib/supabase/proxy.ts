import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_RECOVERY_REQUEST_HEADER } from "@/lib/auth/errors";
import { getSupabasePublicEnv } from "./env";

export async function updateSupabaseSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(AUTH_RECOVERY_REQUEST_HEADER);
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        requestHeaders.set("cookie", request.headers.get("cookie") ?? "");

        const removedAuthCookie = cookiesToSet.some(
          ({ name, value, options }) =>
            name.startsWith("sb-") &&
            name.includes("-auth-token") &&
            value === "" &&
            options.maxAge === 0,
        );

        if (removedAuthCookie) {
          requestHeaders.set(
            AUTH_RECOVERY_REQUEST_HEADER,
            "session_expired",
          );
        }

        response = NextResponse.next({
          request: { headers: requestHeaders },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Authoritative page/action checks classify Auth failures and recover safely.
  }

  return response;
}
