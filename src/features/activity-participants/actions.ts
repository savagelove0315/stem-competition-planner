"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  activityParticipantAssignmentSchema,
  activityParticipantIdSchema,
  type ActivityParticipantAssignmentValues,
} from "./schemas";

export type ActivityParticipantActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<
    Record<keyof ActivityParticipantAssignmentValues, string[]>
  >;
};

const initialErrorState: ActivityParticipantActionState = {
  status: "error",
  message: "Check the participant details and try again.",
};

function getFormValue(
  formData: FormData,
  key: keyof ActivityParticipantAssignmentValues,
): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readAssignmentForm(formData: FormData) {
  return activityParticipantAssignmentSchema.safeParse({
    activityId: getFormValue(formData, "activityId"),
    competitionId: getFormValue(formData, "competitionId"),
    studentId: getFormValue(formData, "studentId"),
  });
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage activity participants.");
  }

  return supabase;
}

function isUniqueParticipantError(error: { code?: string; message: string }) {
  return (
    error.code === "23505" &&
    (error.message.includes("activity_participants_unique") ||
      error.message.includes("activity_id") ||
      error.message.includes("student_id"))
  );
}

function isMissingRegistrationError(error: { code?: string; message: string }) {
  return (
    error.code === "23503" &&
    (error.message.includes("activity_participants_student_competition_fk") ||
      error.message.includes("student_competitions"))
  );
}

function formatParticipantMutationError(error: {
  code?: string;
  message: string;
}) {
  if (isUniqueParticipantError(error)) {
    return "This student is already assigned to the activity.";
  }

  if (isMissingRegistrationError(error)) {
    return "The student must be registered for this activity's competition first.";
  }

  return error.message;
}

export async function addActivityParticipantAction(
  _previousState: ActivityParticipantActionState,
  formData: FormData,
): Promise<ActivityParticipantActionState> {
  const parsed = readAssignmentForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { data: existingRows, error: existingError } = await supabase
      .from("activity_participants")
      .select("id,status")
      .eq("activity_id", parsed.data.activityId)
      .eq("student_id", parsed.data.studentId)
      .limit(1);

    if (existingError) {
      return { status: "error", message: existingError.message };
    }

    const existingParticipant = (
      (existingRows ?? []) as unknown as Array<{
        id: string;
        status: string;
      }>
    )[0];

    if (existingParticipant && existingParticipant.status !== "cancelled") {
      return {
        status: "error",
        message: "This student is already assigned to the activity.",
      };
    }

    if (existingParticipant) {
      const { error } = await supabase
        .from("activity_participants")
        .update({
          competition_id: parsed.data.competitionId,
          status: "assigned",
          assigned_at: new Date().toISOString(),
        })
        .eq("id", existingParticipant.id);

      if (error) {
        return {
          status: "error",
          message: formatParticipantMutationError(error),
        };
      }
    } else {
      const { error } = await supabase.from("activity_participants").insert({
        activity_id: parsed.data.activityId,
        competition_id: parsed.data.competitionId,
        student_id: parsed.data.studentId,
        status: "assigned",
      });

      if (error) {
        return {
          status: "error",
          message: formatParticipantMutationError(error),
        };
      }
    }

    revalidatePath("/activities");
    return { status: "success", message: "Student assigned." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to assign student.",
    };
  }
}

export async function cancelActivityParticipantAction(
  _previousState: ActivityParticipantActionState,
  formData: FormData,
): Promise<ActivityParticipantActionState> {
  const id = activityParticipantIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid participant id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("activity_participants")
      .update({ status: "cancelled" })
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/activities");
    return { status: "success", message: "Student removed from activity." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to remove student.",
    };
  }
}
