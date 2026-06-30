"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  activityFormSchema,
  activityIdSchema,
  type ActivityFormValues,
} from "./schemas";

export type ActivityActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof ActivityFormValues, string[]>>;
};

const initialErrorState: ActivityActionState = {
  status: "error",
  message: "Check the highlighted fields and try again.",
};

function getFormValue(formData: FormData, key: keyof ActivityFormValues): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readActivityForm(formData: FormData) {
  return activityFormSchema.safeParse({
    name: getFormValue(formData, "name"),
    competitionId: getFormValue(formData, "competitionId"),
    activityType: getFormValue(formData, "activityType"),
    startDate: getFormValue(formData, "startDate"),
    endDate: getFormValue(formData, "endDate"),
    startTime: getFormValue(formData, "startTime"),
    endTime: getFormValue(formData, "endTime"),
    location: getFormValue(formData, "location"),
    capacity: getFormValue(formData, "capacity"),
    requiresTeam: formData.get("requiresTeam") === "on",
    status: getFormValue(formData, "status"),
    description: getFormValue(formData, "description"),
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
    throw new Error("You must be signed in to manage activities.");
  }

  return supabase;
}

function toLocalTimestamp(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function toActivityPayload(values: ActivityFormValues) {
  const startsAt = toLocalTimestamp(values.startDate, values.startTime ?? "00:00");
  const endsAt = values.endDate
    ? toLocalTimestamp(values.endDate, values.endTime ?? "23:59")
    : values.endTime
      ? toLocalTimestamp(values.startDate, values.endTime)
      : null;

  return {
    competition_id: values.competitionId,
    name: values.name,
    activity_type: values.activityType,
    description: values.description,
    status: values.status,
    starts_at: startsAt,
    ends_at: endsAt,
    location: values.location,
    capacity: values.capacity,
    requires_team: values.requiresTeam,
    notes: values.notes,
  };
}

export async function createActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const parsed = readActivityForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("activities")
      .insert(toActivityPayload(parsed.data));

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/activities");
    return { status: "success", message: "Activity added." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to add activity.",
    };
  }
}

export async function updateActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const id = activityIdSchema.safeParse(formData.get("id"));
  const parsed = readActivityForm(formData);

  if (!id.success) {
    return { status: "error", message: "Invalid activity id." };
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
      .from("activities")
      .update(toActivityPayload(parsed.data))
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/activities");
    return { status: "success", message: "Activity updated." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to update activity.",
    };
  }
}

export async function cancelActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  return updateActivityStatus(formData, "cancelled", "Activity cancelled.");
}

export async function archiveActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  return updateActivityStatus(formData, "archived", "Activity archived.");
}

async function updateActivityStatus(
  formData: FormData,
  status: "cancelled" | "archived",
  successMessage: string,
): Promise<ActivityActionState> {
  const id = activityIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid activity id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("activities")
      .update({ status })
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/activities");
    return { status: "success", message: successMessage };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update activity status.",
    };
  }
}
