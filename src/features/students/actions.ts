"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  studentFormSchema,
  studentIdSchema,
  type StudentFormValues,
} from "./schemas";

export type StudentActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof StudentFormValues, string[]>>;
};

const initialErrorState: StudentActionState = {
  status: "error",
  message: "Check the highlighted fields and try again.",
};

function getFormValue(formData: FormData, key: keyof StudentFormValues): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalTextValue(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function readStudentForm(formData: FormData) {
  return studentFormSchema.safeParse({
    studentCode: getFormValue(formData, "studentCode"),
    firstName: getFormValue(formData, "firstName"),
    lastName: getFormValue(formData, "lastName"),
    displayName: getFormValue(formData, "displayName"),
    className: getFormValue(formData, "className"),
    gradeLevel: getFormValue(formData, "gradeLevel"),
    email: getFormValue(formData, "email"),
    phone: getFormValue(formData, "phone"),
    guardianName: getFormValue(formData, "guardianName"),
    guardianContact: getFormValue(formData, "guardianContact"),
    parentContact: getFormValue(formData, "parentContact"),
    status: getFormValue(formData, "status"),
    notes: getFormValue(formData, "notes"),
    competitionIds: formData
      .getAll("competitionIds")
      .filter((value): value is string => typeof value === "string"),
  });
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage students.");
  }

  return supabase;
}

function toStudentPayload(values: StudentFormValues) {
  return {
    student_code: optionalTextValue(values.studentCode),
    first_name: values.firstName,
    last_name: values.lastName,
    display_name: optionalTextValue(values.displayName),
    class_name: optionalTextValue(values.className),
    grade_level: optionalTextValue(values.gradeLevel),
    email: optionalTextValue(values.email),
    phone: optionalTextValue(values.phone),
    guardian_name: optionalTextValue(values.guardianName),
    guardian_contact: optionalTextValue(values.guardianContact),
    parent_contact: optionalTextValue(values.parentContact),
    status: values.status,
    notes: optionalTextValue(values.notes),
  };
}

type StudentCompetitionSyncError = {
  message: string;
};

type StudentDeleteSafety = {
  activeCompetitionCount: number;
  activeActivityParticipantCount: number;
  conflictRecordCount: number;
  activeTeamMemberCount: number;
};

function isDuplicateStudentEmailError(error: { code?: string; message: string }) {
  return (
    error.code === "23505" &&
    (error.message.includes("students_email_unique") ||
      error.message.includes("email"))
  );
}

function formatStudentMutationError(
  error: { code?: string; message: string },
  fallbackPrefix: string,
) {
  if (isDuplicateStudentEmailError(error)) {
    return "This email is already used by another student.";
  }

  return `${fallbackPrefix}: ${error.message}`;
}

async function syncStudentCompetitions(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  studentId: string,
  competitionIds: string[],
): Promise<StudentCompetitionSyncError | null> {
  const { data: existingAssignments, error: existingError } = await supabase
    .from("student_competitions")
    .select("competition_id")
    .eq("student_id", studentId);

  if (existingError) {
    return {
      message: `Failed to read existing competition assignments: ${existingError.message}`,
    };
  }

  const selectedCompetitionIds = new Set(competitionIds);
  const existingCompetitionIds = new Set(
    ((existingAssignments ?? []) as unknown as Array<{
      competition_id: string;
    }>).map((assignment) => assignment.competition_id),
  );
  const withdrawnCompetitionIds = [...existingCompetitionIds].filter(
    (competitionId) => !selectedCompetitionIds.has(competitionId),
  );

  if (withdrawnCompetitionIds.length > 0) {
    const { error: withdrawError } = await supabase
      .from("student_competitions")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
      })
      .eq("student_id", studentId)
      .in("competition_id", withdrawnCompetitionIds);

    if (withdrawError) {
      return {
        message: `Failed to withdraw removed competition assignments: ${withdrawError.message}`,
      };
    }
  }

  if (competitionIds.length === 0) {
    return null;
  }

  const { error: upsertError } = await supabase
    .from("student_competitions")
    .upsert(
      competitionIds.map((competitionId) => ({
        student_id: studentId,
        competition_id: competitionId,
        status: "registered",
        withdrawn_at: null,
      })),
      { onConflict: "student_id,competition_id" },
    );

  if (upsertError) {
    return {
      message: `Failed to assign competitions: ${upsertError.message}`,
    };
  }

  return null;
}

async function getStudentDeleteSafety(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  studentId: string,
): Promise<StudentDeleteSafety> {
  const [
    activeCompetitions,
    activeActivityParticipants,
    conflictRecords,
    activeTeamMembers,
  ] = await Promise.all([
    supabase
      .from("student_competitions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .neq("status", "withdrawn"),
    supabase
      .from("activity_participants")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .neq("status", "cancelled"),
    supabase
      .from("conflict_records")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId),
    supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "active"),
  ]);

  const checks = [
    activeCompetitions,
    activeActivityParticipants,
    conflictRecords,
    activeTeamMembers,
  ];
  const firstError = checks.find((check) => check.error)?.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    activeCompetitionCount: activeCompetitions.count ?? 0,
    activeActivityParticipantCount: activeActivityParticipants.count ?? 0,
    conflictRecordCount: conflictRecords.count ?? 0,
    activeTeamMemberCount: activeTeamMembers.count ?? 0,
  };
}

function getStudentDeleteBlockedMessage({
  activeCompetitionCount,
  activeActivityParticipantCount,
  conflictRecordCount,
  activeTeamMemberCount,
}: StudentDeleteSafety): string | null {
  if (activeCompetitionCount > 0) {
    return "This student is still registered in competitions. Withdraw the student first or archive the student.";
  }

  if (activeActivityParticipantCount > 0) {
    return "This student has activity participation records. Remove the student from activities first or archive the student.";
  }

  if (activeTeamMemberCount > 0) {
    return "This student has team membership records. Remove the student from teams first or archive the student.";
  }

  if (conflictRecordCount > 0) {
    return "This student appears in conflict records. Clear those records first or archive the student.";
  }

  return null;
}

async function deleteInactiveStudentJoins(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  studentId: string,
) {
  const [cancelledParticipants, withdrawnCompetitions, inactiveTeamMembers] =
    await Promise.all([
    supabase
      .from("activity_participants")
      .delete()
      .eq("student_id", studentId)
      .eq("status", "cancelled"),
    supabase
      .from("student_competitions")
      .delete()
      .eq("student_id", studentId)
      .eq("status", "withdrawn"),
    supabase
      .from("team_members")
      .delete()
      .eq("student_id", studentId)
      .neq("status", "active"),
  ]);

  const firstError = [
    cancelledParticipants,
    withdrawnCompetitions,
    inactiveTeamMembers,
  ].find((result) => result.error)?.error;

  if (firstError) {
    throw new Error(firstError.message);
  }
}

function revalidateStudentSurfaces() {
  revalidatePath("/students");
  revalidatePath("/activities");
  revalidatePath("/student-timeline");
  revalidatePath("/timeline");
  revalidatePath("/conflicts");
  revalidatePath("/notices");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function createStudentAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const parsed = readStudentForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const studentId = randomUUID();
    const { error } = await supabase
      .from("students")
      .insert({ id: studentId, ...toStudentPayload(parsed.data) });

    if (error) {
      return {
        status: "error",
        message: formatStudentMutationError(
          error,
          "Failed to create student profile",
        ),
      };
    }

    const assignmentError = await syncStudentCompetitions(
      supabase,
      studentId,
      parsed.data.competitionIds,
    );

    if (assignmentError) {
      await supabase.from("students").delete().eq("id", studentId);

      return { status: "error", message: assignmentError.message };
    }

    revalidateStudentSurfaces();
    return { status: "success", message: "Student added." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add student.",
    };
  }
}

export async function updateStudentAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const id = studentIdSchema.safeParse(formData.get("id"));
  const parsed = readStudentForm(formData);

  if (!id.success) {
    return { status: "error", message: "Invalid student id." };
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
      .from("students")
      .update(toStudentPayload(parsed.data))
      .eq("id", id.data);

    if (error) {
      return {
        status: "error",
        message: formatStudentMutationError(
          error,
          "Failed to update student profile",
        ),
      };
    }

    const assignmentError = await syncStudentCompetitions(
      supabase,
      id.data,
      parsed.data.competitionIds,
    );

    if (assignmentError) {
      return { status: "error", message: assignmentError.message };
    }

    revalidateStudentSurfaces();
    return { status: "success", message: "Student updated." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to update student.",
    };
  }
}

export async function archiveStudentAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const id = studentIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid student id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("students")
      .update({ status: "archived" })
      .eq("id", id.data);

    if (error) {
      return {
        status: "error",
        message: `Failed to archive student profile: ${error.message}`,
      };
    }

    revalidateStudentSurfaces();
    return { status: "success", message: "Student archived." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to archive student.",
    };
  }
}

export async function deleteStudentAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const id = studentIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid student id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const deleteSafety = await getStudentDeleteSafety(supabase, id.data);
    const blockedMessage = getStudentDeleteBlockedMessage(deleteSafety);

    if (blockedMessage) {
      return { status: "error", message: blockedMessage };
    }

    await deleteInactiveStudentJoins(supabase, id.data);

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidateStudentSurfaces();
    return { status: "success", message: "Student deleted." };
  } catch (error) {
    console.error("Student delete failed", error);

    return {
      status: "error",
      message:
        "Unexpected database error while deleting the student. Please try again or archive the student instead.",
    };
  }
}
