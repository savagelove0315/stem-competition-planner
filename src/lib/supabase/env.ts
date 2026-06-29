export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

const requiredEnv = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
} as const;

function readRequiredEnv(name: string): string {
  const value =
    name === requiredEnv.url
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeSupabaseUrl(value: string): string {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new Error("Supabase URL must use https unless it points to localhost.");
    }

    return url.origin;
  } catch {
    throw new Error(`${requiredEnv.url} must be a valid URL.`);
  }
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: normalizeSupabaseUrl(readRequiredEnv(requiredEnv.url)),
    anonKey: readRequiredEnv(requiredEnv.anonKey),
  };
}
