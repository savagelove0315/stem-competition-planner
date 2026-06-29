import { NextResponse } from "next/server";

import { checkSupabaseConnection } from "@/lib/supabase/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkSupabaseConnection();

  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
  });
}
