"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  teamAssignmentSchema,
  teamIdSchema,
  teamMemberIdSchema,
  teamUpdateSchema,
  type TeamAssignmentValues,
  type TeamFormValues,
  type TeamUpdateValues,
} from "./schemas";

export type TeamActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<
    Record<keyof (TeamFormValues & TeamUpdateValues & TeamAssignmentValues), string[]>
  >;
};

const initialErrorState: TeamActionState = {
  status: "error",
  message: "Check the team details and try again.",
};

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage teams.");
  }

  return supabase;
}

function readTeamForm(formData: FormData) {
  return {
    competitionId: getFormValue(formData, "competitionId"),
    name: getFormValue(formData, "name"),
    description: getFormValue(formData, "description"),
  };
}

function readTeamAssignmentForm(formData: FormData) {
  return teamAssignmentSchema.safeParse({
    competitionId: getFormValue(formData, "competitionId"),
    teamId: getFormValue(formData, "teamId"),
    studentId: getFormValue(formData, "studentId"),
    role: getFormValue(formData, "role"),
  });
}

function formatTeamMutationError(error: { code?: string; message: string }) {
  if (
    error.code === "23505" &&
    (error.message.includes("teams_name_per_competition_unique") ||
      error.message.includes("competition_id") ||
      error.message.includes("name"))
  ) {
    return "A team with this name already exists for the competition.";
  }

  if (
    error.code === "23505" &&
    error.message.includes("team_members_one_active_team_per_competition_student_idx")
  ) {
    return "This student is already active in another team for this competition.";
  }

  return error.message;
}

async function validateStudentCanJoinCompetitionTeam(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  values: TeamAssignmentValues,
) {
  const [teamResult, enrollmentResult, existingMemberResult] = await Promise.all([
    supabase
      .from("teams")
      .select("id,status")
      .eq("id", values.teamId)
      .eq("competition_id", values.competitionId)
      .limit(1),
    supabase
      .from("student_competitions")
      .select("id,status")
      .eq("student_id", values.studentId)
      .eq("competition_id", values.competitionId)
      .limit(1),
    supabase
      .from("team_members")
      .select("id,team_id,status")
      .eq("student_id", values.studentId)
      .eq("competition_id", values.competitionId)
      .eq("status", "active")
      .limit(1),
  ]);

  const firstError = [teamResult, enrollmentResult, existingMemberResult].find(
    (result) => result.error,
  )?.error;

  if (firstError) {
    return firstError.message;
  }

  const team = ((teamResult.data ?? []) as unknown as Array<{
    id: string;
    status: string;
  }>)[0];

  if (!team) {
    return "Team not found for this competition.";
  }

  if (team.status !== "active") {
    return "Students can only be assigned to active teams.";
  }

  const enrollment = ((enrollmentResult.data ?? []) as unknown as Array<{
    id: string;
    status: string;
  }>)[0];

  if (!enrollment || enrollment.status === "withdrawn") {
    return "Register the student to this competition before assigning a team.";
  }

  const activeMember = ((existingMemberResult.data ?? []) as unknown as Array<{
    id: string;
    team_id: string;
    status: string;
  }>)[0];

  if (activeMember && activeMember.team_id !== values.teamId) {
    return "This student is already active in another team for this competition.";
  }

  return null;
}

function revalidateTeamSurfaces() {
  revalidatePath("/competitions");
  revalidatePath("/teams");
  revalidatePath("/dashboard");
  revalidatePath("/students");
}

export async function createTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const parsed = teamUpdateSchema.omit({ id: true }).safeParse(readTeamForm(formData));

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase.from("teams").insert({
      competition_id: parsed.data.competitionId,
      name: parsed.data.name,
      notes: parsed.data.description,
      status: "active",
    });

    if (error) {
      return { status: "error", message: formatTeamMutationError(error) };
    }

    revalidateTeamSurfaces();
    return { status: "success", message: "Team created." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create team.",
    };
  }
}

export async function updateTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const parsed = teamUpdateSchema.safeParse({
    ...readTeamForm(formData),
    id: getFormValue(formData, "id"),
  });

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("teams")
      .update({
        name: parsed.data.name,
        notes: parsed.data.description,
      })
      .eq("id", parsed.data.id)
      .eq("competition_id", parsed.data.competitionId);

    if (error) {
      return { status: "error", message: formatTeamMutationError(error) };
    }

    revalidateTeamSurfaces();
    return { status: "success", message: "Team updated." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update team.",
    };
  }
}

export async function deleteTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const id = teamIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid team id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { count, error: countError } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", id.data)
      .eq("status", "active");

    if (countError) {
      return { status: "error", message: countError.message };
    }

    if ((count ?? 0) > 0) {
      return {
        status: "error",
        message: "Remove active members before deleting this team.",
      };
    }

    const { error } = await supabase.from("teams").delete().eq("id", id.data);

    if (error) {
      return { status: "error", message: formatTeamMutationError(error) };
    }

    revalidateTeamSurfaces();
    return { status: "success", message: "Team deleted." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to delete team.",
    };
  }
}

export async function assignTeamMemberAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const parsed = readTeamAssignmentForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const validationMessage = await validateStudentCanJoinCompetitionTeam(
      supabase,
      parsed.data,
    );

    if (validationMessage) {
      return { status: "error", message: validationMessage };
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", parsed.data.teamId)
      .eq("student_id", parsed.data.studentId)
      .limit(1);

    if (existingError) {
      return { status: "error", message: existingError.message };
    }

    const existingMember = ((existingRows ?? []) as unknown as Array<{
      id: string;
    }>)[0];

    const mutation = existingMember
      ? supabase
          .from("team_members")
          .update({
            role: parsed.data.role,
            status: "active",
            joined_at: new Date().toISOString(),
            left_at: null,
          })
          .eq("id", existingMember.id)
      : supabase.from("team_members").insert({
          team_id: parsed.data.teamId,
          competition_id: parsed.data.competitionId,
          student_id: parsed.data.studentId,
          role: parsed.data.role,
          status: "active",
        });

    const { error } = await mutation;

    if (error) {
      return { status: "error", message: formatTeamMutationError(error) };
    }

    revalidateTeamSurfaces();
    return { status: "success", message: "Student assigned to team." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to assign student.",
    };
  }
}

export async function removeTeamMemberAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const id = teamMemberIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid team member id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const { error } = await supabase
      .from("team_members")
      .update({
        status: "left",
        left_at: new Date().toISOString(),
      })
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidateTeamSurfaces();
    return { status: "success", message: "Student removed from team." };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to remove student.",
    };
  }
}
