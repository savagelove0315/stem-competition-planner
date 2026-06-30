"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  noticeSettingsKey,
  noticeSettingsSchema,
  type NoticeSettingsFormValues,
} from "./schemas";

export type NoticeSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof NoticeSettingsFormValues, string[]>>;
};

const initialErrorState: NoticeSettingsActionState = {
  status: "error",
  message: "Check the highlighted fields and try again.",
};

function getFormValue(formData: FormData, key: keyof NoticeSettingsFormValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readNoticeSettingsForm(formData: FormData) {
  return noticeSettingsSchema.safeParse({
    teacherDisplayName: getFormValue(formData, "teacherDisplayName"),
    teacherRoleLabel: getFormValue(formData, "teacherRoleLabel"),
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

export async function saveNoticeSettingsAction(
  _previousState: NoticeSettingsActionState,
  formData: FormData,
): Promise<NoticeSettingsActionState> {
  const parsed = readNoticeSettingsForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase.from("app_settings").upsert(
      {
        setting_key: noticeSettingsKey,
        setting_value: parsed.data,
        description: "Default wording and teacher information for parent notices.",
        is_public: false,
      },
      { onConflict: "setting_key" },
    );

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/settings/notices");
    revalidatePath("/notices");
    return { status: "success", message: "Notice settings saved." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to save notice settings.",
    };
  }
}
