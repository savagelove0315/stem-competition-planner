import { getSupabasePublicEnv } from "./env";

export type SupabaseConnectionHealth = {
  ok: boolean;
  checkedAt: string;
  endpoint: string;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlHost?: string;
  status?: number;
  statusText?: string;
  error?: string;
};

function getSafeSupabaseDiagnostics() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let urlHost: string | undefined;

  if (rawUrl) {
    try {
      urlHost = new URL(rawUrl).host;
    } catch {
      urlHost = undefined;
    }
  }

  return {
    hasUrl: Boolean(rawUrl),
    hasAnonKey: Boolean(rawAnonKey),
    urlHost,
  };
}

export async function checkSupabaseConnection(
  fetcher: typeof fetch = fetch,
): Promise<SupabaseConnectionHealth> {
  const checkedAt = new Date().toISOString();
  const diagnostics = getSafeSupabaseDiagnostics();
  let endpoint = "unavailable";

  try {
    const { url, anonKey } = getSupabasePublicEnv();
    endpoint = new URL("/auth/v1/health", url).toString();
    const response = await fetcher(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: anonKey,
      },
      cache: "no-store",
    });

    return {
      ok: response.ok,
      checkedAt,
      endpoint,
      ...diagnostics,
      status: response.status,
      statusText: response.statusText,
      error: response.ok ? undefined : "Supabase health endpoint returned an unsuccessful status.",
    };
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      endpoint,
      ...diagnostics,
      error: error instanceof Error ? error.message : "Unknown Supabase connection error.",
    };
  }
}
