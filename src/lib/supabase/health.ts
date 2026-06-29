import { getSupabasePublicEnv } from "./env";

export type SupabaseConnectionHealth = {
  ok: boolean;
  checkedAt: string;
  endpoint: string;
  status?: number;
  statusText?: string;
  error?: string;
};

export async function checkSupabaseConnection(
  fetcher: typeof fetch = fetch,
): Promise<SupabaseConnectionHealth> {
  const checkedAt = new Date().toISOString();

  try {
    const { url, anonKey } = getSupabasePublicEnv();
    const endpoint = new URL("/auth/v1/health", url).toString();
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
      status: response.status,
      statusText: response.statusText,
      error: response.ok ? undefined : "Supabase health endpoint returned an unsuccessful status.",
    };
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      endpoint: "unavailable",
      error: error instanceof Error ? error.message : "Unknown Supabase connection error.",
    };
  }
}
