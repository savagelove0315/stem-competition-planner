import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  StudentTimelineAssignment,
  StudentTimelineAssignmentRow,
  StudentTimelineCompetition,
  StudentTimelineCompetitionRow,
  StudentTimelineData,
  StudentTimelineStudent,
  StudentTimelineStudentRow,
} from "@/features/student-timeline/types";

function mapCompetition(
  row: StudentTimelineCompetitionRow,
): StudentTimelineCompetition {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    status: row.status,
  };
}

function getStudentName(row: StudentTimelineStudentRow) {
  return (
    row.display_name ??
    [row.first_name, row.last_name].filter(Boolean).join(" ")
  );
}

function mapStudent(row: StudentTimelineStudentRow): StudentTimelineStudent {
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

function mapAssignment(
  row: StudentTimelineAssignmentRow,
): StudentTimelineAssignment {
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

export async function getStudentTimelineData(): Promise<StudentTimelineData> {
  const supabase = await createSupabaseServerClient();
  const [studentsResult, assignmentsResult, competitionsResult] =
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
    ]);

  if (studentsResult.error) {
    throw new Error(`Unable to load timeline students: ${studentsResult.error.message}`);
  }

  if (assignmentsResult.error) {
    throw new Error(
      `Unable to load timeline activity assignments: ${assignmentsResult.error.message}`,
    );
  }

  if (competitionsResult.error) {
    throw new Error(
      `Unable to load timeline competition filters: ${competitionsResult.error.message}`,
    );
  }

  return {
    students: ((studentsResult.data ?? []) as unknown as StudentTimelineStudentRow[])
      .map(mapStudent),
    assignments: (
      (assignmentsResult.data ?? []) as unknown as StudentTimelineAssignmentRow[]
    ).map(mapAssignment),
    competitions: (
      (competitionsResult.data ?? []) as unknown as StudentTimelineCompetitionRow[]
    ).map(mapCompetition),
  };
}
