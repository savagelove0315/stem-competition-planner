import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  defaultNoticeSettings,
  noticeSettingsKey,
  noticeSettingsSchema,
} from "./schemas";
import type { NoticeSettings } from "./types";

function parseNoticeSettings(value: unknown): NoticeSettings {
  const parsed = noticeSettingsSchema.safeParse({
    ...defaultNoticeSettings,
    ...(value && typeof value === "object" ? value : {}),
  });

  return parsed.success ? parsed.data : defaultNoticeSettings;
}

export async function getNoticeSettings(): Promise<NoticeSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("setting_value")
    .eq("setting_key", noticeSettingsKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load notice settings: ${error.message}`);
  }

  return parseNoticeSettings(data?.setting_value);
}
