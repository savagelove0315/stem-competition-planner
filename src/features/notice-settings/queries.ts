import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  competitionNoticeSettingsKey,
  competitionNoticeSettingsSchema,
  defaultCompetitionNoticeSettings,
  defaultTrainingNoticeSettings,
  legacyParentNoticeSettingsKey,
  trainingNoticeSettingsKey,
  trainingNoticeSettingsSchema,
} from "./schemas";
import type {
  CompetitionNoticeSettings,
  TrainingNoticeSettings,
} from "./types";

type GetNoticeSettingsOptions = {
  fallbackOnError?: boolean;
};

type SettingsRow = {
  setting_key: string;
  setting_value: unknown;
};

function parseCompetitionNoticeSettings(
  value: unknown,
): CompetitionNoticeSettings {
  const parsed = competitionNoticeSettingsSchema.safeParse({
    ...defaultCompetitionNoticeSettings,
    ...(value && typeof value === "object" ? value : {}),
  });

  return parsed.success ? parsed.data : defaultCompetitionNoticeSettings;
}

function parseTrainingNoticeSettings(
  value: unknown,
  legacyValue?: unknown,
): TrainingNoticeSettings {
  const legacyTeacherValues =
    legacyValue && typeof legacyValue === "object"
      ? {
          teacherDisplayName:
            "teacherDisplayName" in legacyValue
              ? legacyValue.teacherDisplayName
              : undefined,
          teacherRoleLabel:
            "teacherRoleLabel" in legacyValue
              ? legacyValue.teacherRoleLabel
              : undefined,
        }
      : {};
  const parsed = trainingNoticeSettingsSchema.safeParse({
    ...defaultTrainingNoticeSettings,
    ...legacyTeacherValues,
    ...(value && typeof value === "object" ? value : {}),
  });

  return parsed.success ? parsed.data : defaultTrainingNoticeSettings;
}

async function getNoticeSettingsRows(keys: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("setting_key,setting_value")
    .in("setting_key", keys);

  if (error) {
    throw new Error(`Unable to load notice settings: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as unknown as SettingsRow[]).map((row) => [
      row.setting_key,
      row.setting_value,
    ]),
  );
}

export async function getCompetitionNoticeSettings(
  options: GetNoticeSettingsOptions = {},
): Promise<CompetitionNoticeSettings> {
  try {
    const rows = await getNoticeSettingsRows([
      competitionNoticeSettingsKey,
      legacyParentNoticeSettingsKey,
    ]);

    return parseCompetitionNoticeSettings(
      rows.get(competitionNoticeSettingsKey) ??
        rows.get(legacyParentNoticeSettingsKey),
    );
  } catch (error) {
    if (options.fallbackOnError) {
      return defaultCompetitionNoticeSettings;
    }

    throw error;
  }
}

export async function getTrainingNoticeSettings(
  options: GetNoticeSettingsOptions = {},
): Promise<TrainingNoticeSettings> {
  try {
    const rows = await getNoticeSettingsRows([
      trainingNoticeSettingsKey,
      legacyParentNoticeSettingsKey,
    ]);

    return parseTrainingNoticeSettings(
      rows.get(trainingNoticeSettingsKey),
      rows.get(legacyParentNoticeSettingsKey),
    );
  } catch (error) {
    if (options.fallbackOnError) {
      return defaultTrainingNoticeSettings;
    }

    throw error;
  }
}

export async function getNoticeSettings(
  options: GetNoticeSettingsOptions = {},
) {
  const [competitionSettings, trainingSettings] = await Promise.all([
    getCompetitionNoticeSettings(options),
    getTrainingNoticeSettings(options),
  ]);

  return { competitionSettings, trainingSettings };
}
