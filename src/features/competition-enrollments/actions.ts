"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  competitionEnrollmentIdSchema,
  competitionEnrollmentSchema,
  type CompetitionEnrollmentValues,
} from "./schemas";

export type CompetitionEnrollmentActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof CompetitionEnrollmentValues, string[]>>;
};

const initialErrorState: CompetitionEnrollmentActionState = {
  status: "error",
  message: "Check the enrollment details and try again.",
};

function getFormValue(
  formData: FormData,
  key: keyof CompetitionEnrollmentValues,
): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readEnrollmentForm(formData: FormData) {
  return competitionEnrollmentSchema.safeParse({
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
    throw new Error("You must be signed in to manage competition students.");
  }

  return supabase;
}

function isUniqueEnrollmentError(error: { code?: string; message: string }) {
  return (
    error.code === "23505" &&
    (error.message.includes("student_competitions_student_competition_unique") ||
      error.message.includes("student_id") ||
      error.message.includes("competition_id"))
  );
}

function formatEnrollmentMutationError(error: {
  code?: string;
  message: string;
}) {
  if (isUniqueEnrollmentError(error)) {
    return "This student is already registered for the competition.";
  }

  return error.message;
}

export async function addCompetitionEnrollmentAction(
  _previousState: CompetitionEnrollmentActionState,
  formData: FormData,
): Promise<CompetitionEnrollmentActionState> {
  const parsed = readEnrollmentForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { data: studentRows, error: studentError } = await supabase
      .from("students")
      .select("id,status")
      .eq("id", parsed.data.studentId)
      .limit(1);

    if (studentError) {
      return { status: "error", message: studentError.message };
    }

    const student = ((studentRows ?? []) as unknown as Array<{
      id: string;
      status: string;
    }>)[0];

    if (!student) {
      return { status: "error", message: "Student not found." };
    }

    if (student.status !== "active") {
      return {
        status: "error",
        message: "Only active students can be registered for competitions.",
      };
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("student_competitions")
      .select("id,status")
      .eq("student_id", parsed.data.studentId)
      .eq("competition_id", parsed.data.competitionId)
      .limit(1);

    if (existingError) {
      return { status: "error", message: existingError.message };
    }

    const existingEnrollment = (
      (existingRows ?? []) as unknown as Array<{
        id: string;
        status: string;
      }>
    )[0];

    if (existingEnrollment && existingEnrollment.status !== "withdrawn") {
      return {
        status: "error",
        message: "This student is already registered for the competition.",
      };
    }

    if (existingEnrollment) {
      const { error } = await supabase
        .from("student_competitions")
        .update({
          status: "registered",
          registered_at: new Date().toISOString(),
          withdrawn_at: null,
        })
        .eq("id", existingEnrollment.id);

      if (error) {
        return {
          status: "error",
          message: formatEnrollmentMutationError(error),
        };
      }
    } else {
      const { error } = await supabase.from("student_competitions").insert({
        student_id: parsed.data.studentId,
        competition_id: parsed.data.competitionId,
        status: "registered",
      });

      if (error) {
        return {
          status: "error",
          message: formatEnrollmentMutationError(error),
        };
      }
    }

    revalidatePath("/competitions");
    revalidatePath("/activities");
    revalidatePath("/students");
    return { status: "success", message: "Student registered." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to register student.",
    };
  }
}

export async function withdrawCompetitionEnrollmentAction(
  _previousState: CompetitionEnrollmentActionState,
  formData: FormData,
): Promise<CompetitionEnrollmentActionState> {
  const id = competitionEnrollmentIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid enrollment id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("student_competitions")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
      })
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/competitions");
    revalidatePath("/activities");
    revalidatePath("/students");
    return { status: "success", message: "Student withdrawn." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to withdraw student.",
    };
  }
}
