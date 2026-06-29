"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  competitionFormSchema,
  competitionIdSchema,
  type CompetitionFormValues,
} from "./schemas";

export type CompetitionActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof CompetitionFormValues, string[]>>;
};

const initialErrorState: CompetitionActionState = {
  status: "error",
  message: "Check the highlighted fields and try again.",
};

function getFormValue(formData: FormData, key: keyof CompetitionFormValues): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readCompetitionForm(formData: FormData) {
  return competitionFormSchema.safeParse({
    name: getFormValue(formData, "name"),
    shortName: getFormValue(formData, "shortName"),
    color: getFormValue(formData, "color"),
    icon: getFormValue(formData, "icon"),
    category: getFormValue(formData, "category"),
    description: getFormValue(formData, "description"),
    status: getFormValue(formData, "status"),
    startsAt: getFormValue(formData, "startsAt"),
    endsAt: getFormValue(formData, "endsAt"),
    registrationOpensAt: getFormValue(formData, "registrationOpensAt"),
    registrationClosesAt: getFormValue(formData, "registrationClosesAt"),
    notes: getFormValue(formData, "notes"),
  });
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage competitions.");
  }

  return supabase;
}

function toCompetitionPayload(values: CompetitionFormValues) {
  return {
    name: values.name,
    short_name: values.shortName,
    color: values.color,
    icon: values.icon,
    category: values.category,
    description: values.description,
    status: values.status,
    starts_at: values.startsAt,
    ends_at: values.endsAt,
    registration_opens_at: values.registrationOpensAt,
    registration_closes_at: values.registrationClosesAt,
    notes: values.notes,
  };
}

export async function createCompetitionAction(
  _previousState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const parsed = readCompetitionForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("competitions")
      .insert(toCompetitionPayload(parsed.data));

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/competitions");
    return { status: "success", message: "Competition added." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add competition.",
    };
  }
}

export async function updateCompetitionAction(
  _previousState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const id = competitionIdSchema.safeParse(formData.get("id"));
  const parsed = readCompetitionForm(formData);

  if (!id.success) {
    return { status: "error", message: "Invalid competition id." };
  }

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("competitions")
      .update(toCompetitionPayload(parsed.data))
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/competitions");
    return { status: "success", message: "Competition updated." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update competition.",
    };
  }
}

export async function archiveCompetitionAction(
  _previousState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const id = competitionIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid competition id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("competitions")
      .update({ status: "archived" })
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/competitions");
    return { status: "success", message: "Competition archived." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to archive competition.",
    };
  }
}
