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

function readUuidList(formData: FormData, key: string) {
  return [
    ...new Set(
      formData
        .getAll(key)
        .filter((value): value is string => typeof value === "string")
        .filter((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)),
    ),
  ];
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

type ActivityDeleteSafety = {
  activeParticipantCount: number;
};

type ResolvedActivityParticipants =
  | { ok: true; studentIds: string[] }
  | { ok: false; message: string };

async function getActivityDeleteSafety(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  activityId: string,
): Promise<ActivityDeleteSafety> {
  const { count, error } = await supabase
    .from("activity_participants")
    .select("id", { count: "exact", head: true })
    .eq("activity_id", activityId)
    .neq("status", "cancelled");

  if (error) {
    throw new Error(error.message);
  }

  return {
    activeParticipantCount: count ?? 0,
  };
}

function getActivityDeleteBlockedMessage({
  activeParticipantCount,
}: ActivityDeleteSafety): string | null {
  if (activeParticipantCount > 0) {
    return "This activity still has participants. Remove participants first or cancel/archive the activity.";
  }

  return null;
}

async function deleteActivityConflictRecords(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  activityId: string,
) {
  const { error } = await supabase
    .from("conflict_records")
    .delete()
    .or(`primary_activity_id.eq.${activityId},conflicting_activity_id.eq.${activityId}`);

  if (error) {
    throw new Error(
      `Unable to clear old conflict records for this activity: ${error.message}`,
    );
  }
}

async function deleteInactiveActivityJoins(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  activityId: string,
) {
  const { error } = await supabase
    .from("activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("status", "cancelled");

  if (error) {
    throw new Error(
      `Unable to clear cancelled participant links for this activity: ${error.message}`,
    );
  }
}

async function resolveCreateActivityParticipantIds(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  competitionId: string,
  selectedTeamIds: string[],
  selectedStudentIds: string[],
): Promise<ResolvedActivityParticipants> {
  if (selectedTeamIds.length === 0 && selectedStudentIds.length === 0) {
    return { ok: true, studentIds: [] };
  }

  const [competitionResult, enrollmentResult, teamResult, teamMemberResult] =
    await Promise.all([
      supabase
        .from("competitions")
        .select("id")
        .eq("id", competitionId)
        .limit(1),
      supabase
        .from("student_competitions")
        .select("student_id,status,students!inner(id,status)")
        .eq("competition_id", competitionId)
        .neq("status", "withdrawn"),
      selectedTeamIds.length > 0
        ? supabase
            .from("teams")
            .select("id,status")
            .eq("competition_id", competitionId)
            .in("id", selectedTeamIds)
        : Promise.resolve({ data: [], error: null }),
      selectedTeamIds.length > 0
        ? supabase
            .from("team_members")
            .select("team_id,student_id,status")
            .eq("competition_id", competitionId)
            .eq("status", "active")
            .in("team_id", selectedTeamIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const firstError = [
    competitionResult,
    enrollmentResult,
    teamResult,
    teamMemberResult,
  ].find((result) => result.error)?.error;

  if (firstError) {
    return { ok: false, message: firstError.message };
  }

  if (((competitionResult.data ?? []) as unknown[]).length === 0) {
    return { ok: false, message: "Competition not found." };
  }

  const activeRegisteredStudentIds = new Set(
    ((enrollmentResult.data ?? []) as unknown as Array<{
      student_id: string;
      students: { status: string } | null;
    }>)
      .filter((row) => row.students?.status === "active")
      .map((row) => row.student_id),
  );

  const invalidSelectedStudentId = selectedStudentIds.find(
    (studentId) => !activeRegisteredStudentIds.has(studentId),
  );

  if (invalidSelectedStudentId) {
    return {
      ok: false,
      message:
        "Only active students registered to the competition can be assigned.",
    };
  }

  const teamRows = (teamResult.data ?? []) as unknown as Array<{
    id: string;
    status: string;
  }>;
  const activeTeamIds = new Set(
    teamRows.filter((team) => team.status === "active").map((team) => team.id),
  );

  if (activeTeamIds.size !== selectedTeamIds.length) {
    return {
      ok: false,
      message: "Only active teams from this competition can be assigned.",
    };
  }

  const teamMemberStudentIds = (
    (teamMemberResult.data ?? []) as unknown as Array<{
      student_id: string;
    }>
  )
    .filter((row) => activeRegisteredStudentIds.has(row.student_id))
    .map((row) => row.student_id);

  return {
    ok: true,
    studentIds: [...new Set([...selectedStudentIds, ...teamMemberStudentIds])],
  };
}

function revalidateActivitySurfaces() {
  revalidatePath("/activities");
  revalidatePath("/student-timeline");
  revalidatePath("/timeline");
  revalidatePath("/conflicts");
  revalidatePath("/notices");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
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
    const selectedTeamIds = readUuidList(formData, "teamIds");
    const selectedStudentIds = readUuidList(formData, "studentIds");
    const resolvedParticipants = await resolveCreateActivityParticipantIds(
      supabase,
      parsed.data.competitionId,
      selectedTeamIds,
      selectedStudentIds,
    );

    if (!resolvedParticipants.ok) {
      return { status: "error", message: resolvedParticipants.message };
    }

    const { data, error } = await supabase
      .from("activities")
      .insert(toActivityPayload(parsed.data))
      .select("id")
      .single();

    if (error) {
      return { status: "error", message: error.message };
    }

    const activity = data as unknown as { id: string } | null;

    if (!activity) {
      return {
        status: "error",
        message: "Activity was created, but its id was not returned.",
      };
    }

    if (resolvedParticipants.studentIds.length > 0) {
      const { error: participantError } = await supabase
        .from("activity_participants")
        .insert(
          resolvedParticipants.studentIds.map((studentId) => ({
            activity_id: activity.id,
            competition_id: parsed.data.competitionId,
            student_id: studentId,
            status: "assigned",
          })),
        );

      if (participantError) {
        return {
          status: "error",
          message: `Activity created, but participant assignment failed: ${participantError.message}`,
        };
      }
    }

    revalidateActivitySurfaces();
    return {
      status: "success",
      message:
        resolvedParticipants.studentIds.length > 0
          ? `Activity added with ${resolvedParticipants.studentIds.length} participant${resolvedParticipants.studentIds.length === 1 ? "" : "s"}.`
          : "Activity added.",
    };
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

    revalidateActivitySurfaces();
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

    revalidateActivitySurfaces();
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

export async function deleteActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const id = activityIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid activity id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const deleteSafety = await getActivityDeleteSafety(supabase, id.data);
    const blockedMessage = getActivityDeleteBlockedMessage(deleteSafety);

    if (blockedMessage) {
      return { status: "error", message: blockedMessage };
    }

    await deleteActivityConflictRecords(supabase, id.data);
    await deleteInactiveActivityJoins(supabase, id.data);

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidateActivitySurfaces();
    return { status: "success", message: "Activity deleted." };
  } catch (error) {
    console.error("Activity delete failed", error);

    if (
      error instanceof Error &&
      (error.message.startsWith("Unable to clear old conflict records") ||
        error.message.startsWith("Unable to clear cancelled participant links"))
    ) {
      return { status: "error", message: error.message };
    }

    return {
      status: "error",
      message:
        "Unexpected database error while deleting the activity. Please try again or cancel/archive the activity instead.",
    };
  }
}
