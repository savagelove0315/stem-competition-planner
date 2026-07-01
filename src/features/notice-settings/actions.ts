"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  competitionNoticeSettingsKey,
  competitionNoticeSettingsSchema,
  trainingNoticeSettingsKey,
  trainingNoticeSettingsSchema,
  type CompetitionNoticeSettingsFormValues,
  type TrainingNoticeSettingsFormValues,
} from "./schemas";
import type { NoticeSettingsActionState } from "./types";

type CompetitionNoticeSettingsField =
  keyof CompetitionNoticeSettingsFormValues;
type TrainingNoticeSettingsField = keyof TrainingNoticeSettingsFormValues;

function getFormValue<TField extends string>(formData: FormData, key: TField) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readCompetitionNoticeSettingsForm(formData: FormData) {
  return competitionNoticeSettingsSchema.safeParse({
    teacherDisplayName: getFormValue(formData, "teacherDisplayName"),
    teacherRoleLabel: getFormValue(formData, "teacherRoleLabel"),
    officialNoticeLabel: getFormValue(formData, "officialNoticeLabel"),
    noticeTitleChinese: getFormValue(formData, "noticeTitleChinese"),
    noticeSubtitleEnglish: getFormValue(formData, "noticeSubtitleEnglish"),
    openingGreeting: getFormValue(formData, "openingGreeting"),
    mainSentenceTemplate: getFormValue(formData, "mainSentenceTemplate"),
    trainingMessage: getFormValue(formData, "trainingMessage"),
    supportMessage: getFormValue(formData, "supportMessage"),
    thankYouLine: getFormValue(formData, "thankYouLine"),
    footerNote: getFormValue(formData, "footerNote"),
  });
}

function readTrainingNoticeSettingsForm(formData: FormData) {
  return trainingNoticeSettingsSchema.safeParse({
    teacherDisplayName: getFormValue(formData, "teacherDisplayName"),
    teacherRoleLabel: getFormValue(formData, "teacherRoleLabel"),
    officialNoticeLabel: getFormValue(formData, "officialNoticeLabel"),
    noticeTitleChinese: getFormValue(formData, "noticeTitleChinese"),
    noticeSubtitleEnglish: getFormValue(formData, "noticeSubtitleEnglish"),
    openingGreeting: getFormValue(formData, "openingGreeting"),
    mainSentenceTemplate: getFormValue(formData, "mainSentenceTemplate"),
    reminderLine: getFormValue(formData, "reminderLine"),
    thankYouLine: getFormValue(formData, "thankYouLine"),
    defaultWhatToBring: getFormValue(formData, "defaultWhatToBring"),
    footerNote: getFormValue(formData, "footerNote"),
  });
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage notice settings.");
  }

  return supabase;
}

async function saveSettings({
  settingKey,
  settingValue,
  description,
}: {
  settingKey: string;
  settingValue: unknown;
  description: string;
}) {
  const supabase = await requireAuthenticatedClient();
  const { error } = await supabase.from("app_settings").upsert(
    {
      setting_key: settingKey,
      setting_value: settingValue,
      description,
      is_public: false,
    },
    { onConflict: "setting_key" },
  );

  if (error) {
    return { status: "error" as const, message: error.message };
  }

  revalidatePath("/settings/notices");
  revalidatePath("/notices");
  return { status: "success" as const, message: "Notice settings saved." };
}

export async function saveCompetitionNoticeSettingsAction(
  _previousState: NoticeSettingsActionState<CompetitionNoticeSettingsField>,
  formData: FormData,
): Promise<NoticeSettingsActionState<CompetitionNoticeSettingsField>> {
  const parsed = readCompetitionNoticeSettingsForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    return await saveSettings({
      settingKey: competitionNoticeSettingsKey,
      settingValue: parsed.data,
      description:
        "Default wording and teacher information for competition notices.",
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to save notice settings.",
    };
  }
}

export async function saveTrainingNoticeSettingsAction(
  _previousState: NoticeSettingsActionState<TrainingNoticeSettingsField>,
  formData: FormData,
): Promise<NoticeSettingsActionState<TrainingNoticeSettingsField>> {
  const parsed = readTrainingNoticeSettingsForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    return await saveSettings({
      settingKey: trainingNoticeSettingsKey,
      settingValue: parsed.data,
      description: "Default wording and teacher information for training notices.",
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to save notice settings.",
    };
  }
}
