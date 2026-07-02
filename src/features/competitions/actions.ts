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
    noticeMode: getFormValue(formData, "noticeMode"),
    noticePeriod: getFormValue(formData, "noticePeriod"),
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
    notice_mode: values.noticeMode,
    notice_period: values.noticePeriod,
    description: values.description,
    status: values.status,
    starts_at: values.startsAt,
    ends_at: values.endsAt,
    registration_opens_at: values.registrationOpensAt,
    registration_closes_at: values.registrationClosesAt,
    notes: values.notes,
  };
}

type CompetitionDeleteSafety = {
  activeEnrollmentCount: number;
  activityCount: number;
  teamCount: number;
  activeTeamMemberCount: number;
};

async function getCompetitionDeleteSafety(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  competitionId: string,
): Promise<CompetitionDeleteSafety> {
  const [activeEnrollments, activities, teams, activeTeamMembers] =
    await Promise.all([
    supabase
      .from("student_competitions")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId)
      .neq("status", "withdrawn"),
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId),
    supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId)
      .eq("status", "active"),
  ]);

  const checks = [activeEnrollments, activities, teams, activeTeamMembers];
  const firstError = checks.find((check) => check.error)?.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    activeEnrollmentCount: activeEnrollments.count ?? 0,
    activityCount: activities.count ?? 0,
    teamCount: teams.count ?? 0,
    activeTeamMemberCount: activeTeamMembers.count ?? 0,
  };
}

function getDeleteBlockedMessage({
  activeEnrollmentCount,
  activityCount,
  activeTeamMemberCount,
}: CompetitionDeleteSafety): string | null {
  if (activeTeamMemberCount > 0) {
    return "This competition still has active team members. Remove students from teams before deleting the competition, or archive it.";
  }

  if (activeEnrollmentCount > 0 && activityCount > 0) {
    return "This competition still has registered students and activities. Withdraw students and remove activities first, or archive the competition.";
  }

  if (activeEnrollmentCount > 0) {
    return "This competition still has registered students. Withdraw students first or archive the competition.";
  }

  if (activityCount > 0) {
    return "This competition has activities. Archive it instead, or remove the activities first.";
  }

  return null;
}

async function deleteSafeCompetitionJoins(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedClient>>,
  competitionId: string,
) {
  const [withdrawnEnrollments, inactiveTeamMembers, teams] = await Promise.all([
    supabase
      .from("student_competitions")
      .delete()
      .eq("competition_id", competitionId)
      .eq("status", "withdrawn"),
    supabase
      .from("team_members")
      .delete()
      .eq("competition_id", competitionId)
      .neq("status", "active"),
    supabase.from("teams").delete().eq("competition_id", competitionId),
  ]);

  const error = [withdrawnEnrollments, inactiveTeamMembers, teams].find(
    (result) => result.error,
  )?.error;

  if (error) {
    throw new Error(error.message);
  }
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

export async function deleteCompetitionAction(
  _previousState: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const id = competitionIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    return { status: "error", message: "Invalid competition id." };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const deleteSafety = await getCompetitionDeleteSafety(supabase, id.data);
    const blockedMessage = getDeleteBlockedMessage(deleteSafety);

    if (blockedMessage) {
      return {
        status: "error",
        message: blockedMessage,
      };
    }

    await deleteSafeCompetitionJoins(supabase, id.data);

    const { error } = await supabase
      .from("competitions")
      .delete()
      .eq("id", id.data);

    if (error) {
      return { status: "error", message: error.message };
    }

    revalidatePath("/competitions");
    return { status: "success", message: "Competition deleted." };
  } catch (error) {
    console.error("Competition delete failed", error);

    return {
      status: "error",
      message:
        "Unexpected database error while deleting the competition. Please try again or archive it instead.",
    };
  }
}
