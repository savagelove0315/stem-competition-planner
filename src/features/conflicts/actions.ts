"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  conflictReviewActionSchema,
  type ConflictReviewActionState,
  type ConflictReviewActionValues,
} from "./schemas";

type ExistingConflictRecord = {
  id: string;
  status: string;
  primary_activity_id: string;
  conflicting_activity_id: string;
  teacher_note: string | null;
  resolution_note: string | null;
  reviewed_at: string | null;
  resolved_at: string | null;
};

const initialErrorState: ConflictReviewActionState = {
  status: "error",
  message: "Check the conflict review details and try again.",
};

function getFormValue(
  formData: FormData,
  key: keyof ConflictReviewActionValues,
): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readReviewForm(formData: FormData) {
  return conflictReviewActionSchema.safeParse({
    intent: getFormValue(formData, "intent"),
    conflictKey: getFormValue(formData, "conflictKey"),
    studentId: getFormValue(formData, "studentId"),
    studentName: getFormValue(formData, "studentName"),
    activityOneId: getFormValue(formData, "activityOneId"),
    activityOneCompetitionId: getFormValue(formData, "activityOneCompetitionId"),
    activityOneName: getFormValue(formData, "activityOneName"),
    activityTwoId: getFormValue(formData, "activityTwoId"),
    activityTwoCompetitionId: getFormValue(formData, "activityTwoCompetitionId"),
    activityTwoName: getFormValue(formData, "activityTwoName"),
    conflictStartDate: getFormValue(formData, "conflictStartDate"),
    conflictEndDate: getFormValue(formData, "conflictEndDate"),
    conflictDateLabel: getFormValue(formData, "conflictDateLabel"),
    severity: getFormValue(formData, "severity"),
    reason: getFormValue(formData, "reason"),
    suggestedAction: getFormValue(formData, "suggestedAction"),
    teacherNote: getFormValue(formData, "teacherNote"),
    resolutionNote: getFormValue(formData, "resolutionNote"),
  });
}

async function requireAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to review conflicts.");
  }

  return supabase;
}

function getOrderedActivityPair(values: ConflictReviewActionValues) {
  const activities = [
    {
      id: values.activityOneId,
      competitionId: values.activityOneCompetitionId,
      name: values.activityOneName,
    },
    {
      id: values.activityTwoId,
      competitionId: values.activityTwoCompetitionId,
      name: values.activityTwoName,
    },
  ].sort((left, right) => left.id.localeCompare(right.id));

  return {
    primary: activities[0],
    conflicting: activities[1],
  };
}

function getStatusPayload(
  values: ConflictReviewActionValues,
  existingRecord: ExistingConflictRecord | null,
) {
  const now = new Date().toISOString();

  if (values.intent === "review") {
    return {
      status: "acknowledged",
      reviewed_at: now,
      resolved_at: null,
    };
  }

  if (values.intent === "resolve") {
    return {
      status: "resolved",
      reviewed_at: now,
      resolved_at: now,
    };
  }

  if (values.intent === "reopen") {
    return {
      status: "open",
      reviewed_at: null,
      resolved_at: null,
    };
  }

  return {
    status: existingRecord?.status ?? "open",
    reviewed_at: existingRecord?.reviewed_at ?? null,
    resolved_at: existingRecord?.resolved_at ?? null,
  };
}

function getMutationMessage(intent: ConflictReviewActionValues["intent"]) {
  if (intent === "review") {
    return "Conflict marked as reviewed.";
  }

  if (intent === "resolve") {
    return "Conflict marked as resolved.";
  }

  if (intent === "reopen") {
    return "Conflict reopened.";
  }

  return "Conflict note saved.";
}

function getConflictSummary(values: ConflictReviewActionValues) {
  return `${values.studentName}: ${values.activityOneName} conflicts with ${values.activityTwoName} on ${values.conflictDateLabel}`;
}

async function findExistingConflictRecord(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  values: ConflictReviewActionValues,
): Promise<ExistingConflictRecord | null> {
  const { data: exactRows, error: exactError } = await supabase
    .from("conflict_records")
    .select(
      "id,status,primary_activity_id,conflicting_activity_id,teacher_note,resolution_note,reviewed_at,resolved_at",
    )
    .eq("conflict_key", values.conflictKey)
    .limit(1);

  if (exactError) {
    throw new Error(exactError.message);
  }

  const exactRecord = (
    (exactRows ?? []) as unknown as ExistingConflictRecord[]
  )[0];

  if (exactRecord) {
    return exactRecord;
  }

  const { data: candidateRows, error: candidateError } = await supabase
    .from("conflict_records")
    .select(
      "id,status,primary_activity_id,conflicting_activity_id,teacher_note,resolution_note,reviewed_at,resolved_at",
    )
    .eq("conflict_type", "student_overlap")
    .eq("student_id", values.studentId)
    .eq("conflict_start_date", values.conflictStartDate)
    .eq("conflict_end_date", values.conflictEndDate);

  if (candidateError) {
    throw new Error(candidateError.message);
  }

  const activityIds = [values.activityOneId, values.activityTwoId].sort();

  return (
    ((candidateRows ?? []) as unknown as ExistingConflictRecord[]).find((row) => {
      const rowActivityIds = [
        row.primary_activity_id,
        row.conflicting_activity_id,
      ].sort();

      return (
        rowActivityIds[0] === activityIds[0] &&
        rowActivityIds[1] === activityIds[1]
      );
    }) ?? null
  );
}

function buildReviewPayload(
  values: ConflictReviewActionValues,
  existingRecord: ExistingConflictRecord | null,
) {
  const orderedPair = getOrderedActivityPair(values);
  const teacherNote =
    values.teacherNote ?? existingRecord?.teacher_note ?? null;
  const resolutionNote =
    values.resolutionNote ?? existingRecord?.resolution_note ?? null;

  return {
    conflict_key: values.conflictKey,
    conflict_type: "student_overlap",
    severity: values.severity,
    primary_competition_id: orderedPair.primary.competitionId,
    primary_activity_id: orderedPair.primary.id,
    conflicting_competition_id: orderedPair.conflicting.competitionId,
    conflicting_activity_id: orderedPair.conflicting.id,
    student_id: values.studentId,
    summary: getConflictSummary(values),
    details: {
      computedSeverity: values.severity,
      reason: values.reason,
      suggestedAction: values.suggestedAction,
      conflictDateLabel: values.conflictDateLabel,
      activities: [
        {
          id: values.activityOneId,
          name: values.activityOneName,
          competitionId: values.activityOneCompetitionId,
        },
        {
          id: values.activityTwoId,
          name: values.activityTwoName,
          competitionId: values.activityTwoCompetitionId,
        },
      ],
    },
    conflict_start_date: values.conflictStartDate,
    conflict_end_date: values.conflictEndDate,
    teacher_note: teacherNote,
    resolution_note: resolutionNote,
    last_seen_at: new Date().toISOString(),
    ...getStatusPayload(values, existingRecord),
  };
}

export async function updateConflictReviewAction(
  _previousState: ConflictReviewActionState,
  formData: FormData,
): Promise<ConflictReviewActionState> {
  const parsed = readReviewForm(formData);

  if (!parsed.success) {
    return {
      ...initialErrorState,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await requireAuthenticatedClient();
    const existingRecord = await findExistingConflictRecord(supabase, parsed.data);
    const payload = buildReviewPayload(parsed.data, existingRecord);
    const result = existingRecord
      ? await supabase
          .from("conflict_records")
          .update(payload)
          .eq("id", existingRecord.id)
      : await supabase.from("conflict_records").insert(payload);

    if (result.error) {
      return { status: "error", message: result.error.message };
    }

    revalidatePath("/conflicts");
    return {
      status: "success",
      message: getMutationMessage(parsed.data.intent),
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update conflict review.",
    };
  }
}
