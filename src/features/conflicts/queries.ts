import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConflictAssignment,
  ConflictAssignmentRow,
  ConflictCompetition,
  ConflictCompetitionRow,
  ConflictData,
  ConflictReviewRecord,
  ConflictReviewRecordRow,
  ConflictStudent,
  ConflictStudentRow,
} from "@/features/conflicts/types";

function mapCompetition(row: ConflictCompetitionRow): ConflictCompetition {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    status: row.status,
  };
}

function getStudentName(row: ConflictStudentRow) {
  return (
    row.display_name ??
    [row.first_name, row.last_name].filter(Boolean).join(" ")
  );
}

function mapStudent(row: ConflictStudentRow): ConflictStudent {
  const registeredCompetitionIds = (row.student_competitions ?? [])
    .filter((assignment) => assignment.status !== "withdrawn")
    .map((assignment) => assignment.competition_id);

  return {
    id: row.id,
    studentCode: row.student_code,
    name: getStudentName(row),
    className: row.class_name,
    gradeLevel: row.grade_level,
    status: row.status,
    registeredCompetitionIds,
    activeCompetitionCount: registeredCompetitionIds.length,
    isMultiCompetition: registeredCompetitionIds.length >= 2,
  };
}

function mapAssignment(row: ConflictAssignmentRow): ConflictAssignment {
  return {
    id: row.id,
    activityId: row.activity_id,
    competitionId: row.competition_id,
    studentId: row.student_id,
    status: row.status,
    assignedAt: row.assigned_at,
    activity: row.activities
      ? {
          id: row.activities.id,
          competitionId: row.activities.competition_id,
          name: row.activities.name,
          activityType: row.activities.activity_type,
          status: row.activities.status,
          startsAt: row.activities.starts_at,
          endsAt: row.activities.ends_at,
          competition: row.activities.competitions
            ? mapCompetition(row.activities.competitions)
            : null,
        }
      : null,
  };
}

function mapReviewRecord(row: ConflictReviewRecordRow): ConflictReviewRecord {
  return {
    id: row.id,
    conflictKey: row.conflict_key,
    conflictType: row.conflict_type,
    severity: row.severity,
    status: row.status,
    primaryCompetitionId: row.primary_competition_id,
    primaryActivityId: row.primary_activity_id,
    conflictingCompetitionId: row.conflicting_competition_id,
    conflictingActivityId: row.conflicting_activity_id,
    studentId: row.student_id,
    teamId: row.team_id,
    summary: row.summary,
    details: row.details,
    conflictStartDate: row.conflict_start_date,
    conflictEndDate: row.conflict_end_date,
    teacherNote: row.teacher_note,
    resolutionNote: row.resolution_note,
    reviewedAt: row.reviewed_at,
    lastSeenAt: row.last_seen_at,
    detectedAt: row.detected_at,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getConflictDetectionData(): Promise<ConflictData> {
  const supabase = await createSupabaseServerClient();
  const [studentsResult, assignmentsResult, competitionsResult, reviewRecordsResult] =
    await Promise.all([
      supabase
        .from("students")
        .select(
          `
            id,
            student_code,
            first_name,
            last_name,
            display_name,
            class_name,
            grade_level,
            status,
            student_competitions (
              competition_id,
              status
            )
          `,
        )
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true }),
      supabase
        .from("activity_participants")
        .select(
          `
            id,
            activity_id,
            competition_id,
            student_id,
            status,
            assigned_at,
            activities (
              id,
              competition_id,
              name,
              activity_type,
              status,
              starts_at,
              ends_at,
              competitions (
                id,
                name,
                short_name,
                color,
                status
              )
            )
          `,
        )
        .neq("status", "cancelled")
        .order("assigned_at", { ascending: true }),
      supabase
        .from("competitions")
        .select("id,name,short_name,color,status")
        .order("name", { ascending: true }),
      supabase
        .from("conflict_records")
        .select(
          `
            id,
            conflict_key,
            conflict_type,
            severity,
            status,
            primary_competition_id,
            primary_activity_id,
            conflicting_competition_id,
            conflicting_activity_id,
            student_id,
            team_id,
            summary,
            details,
            conflict_start_date,
            conflict_end_date,
            teacher_note,
            resolution_note,
            reviewed_at,
            last_seen_at,
            detected_at,
            resolved_at,
            created_at,
            updated_at
          `,
        )
        .eq("conflict_type", "student_overlap")
        .order("updated_at", { ascending: false }),
    ]);

  if (studentsResult.error) {
    throw new Error(
      `Unable to load conflict students: ${studentsResult.error.message}`,
    );
  }

  if (assignmentsResult.error) {
    throw new Error(
      `Unable to load conflict activity assignments: ${assignmentsResult.error.message}`,
    );
  }

  if (competitionsResult.error) {
    throw new Error(
      `Unable to load conflict competition filters: ${competitionsResult.error.message}`,
    );
  }

  if (reviewRecordsResult.error) {
    throw new Error(
      `Unable to load conflict review records: ${reviewRecordsResult.error.message}`,
    );
  }

  return {
    students: ((studentsResult.data ?? []) as unknown as ConflictStudentRow[]).map(
      mapStudent,
    ),
    assignments: (
      (assignmentsResult.data ?? []) as unknown as ConflictAssignmentRow[]
    ).map(mapAssignment),
    competitions: (
      (competitionsResult.data ?? []) as unknown as ConflictCompetitionRow[]
    ).map(mapCompetition),
    reviewRecords: (
      (reviewRecordsResult.data ?? []) as unknown as ConflictReviewRecordRow[]
    ).map(mapReviewRecord),
  };
}
