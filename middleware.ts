import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = new Set(["/login", "/api/health/supabase"]);
const protectedRoutes = [
  "/dashboard",
  "/competitions",
  "/students",
  "/activities",
  "/timeline",
  "/student-timeline",
  "/conflicts",
  "/notices",
  "/settings",
  "/teams",
  "/reports",
];

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }

  return value;
}

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.has(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function hasSupabasePublicEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = hasSupabasePublicEnv() && hasSupabaseAuthCookie(request);

  if (!hasAuthCookie && !isPublicRoute(pathname) && isProtectedRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl, 307);
  }

  if (hasAuthCookie && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getSafeNextPath(request.nextUrl.searchParams.get("next"));
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
