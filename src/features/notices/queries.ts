import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  NoticeCompetition,
  NoticeStudent,
  NoticeStudentCompetitionRow,
  NoticeStudentRow,
} from "./types";

function getStudentName(
  row: Pick<NoticeStudentRow, "display_name" | "first_name" | "last_name">,
) {
  return (
    row.display_name ??
    [row.first_name, row.last_name].filter(Boolean).join(" ")
  );
}

function mapCompetition(
  assignment: NoticeStudentCompetitionRow & {
    competitions: NonNullable<NoticeStudentCompetitionRow["competitions"]>;
  },
): NoticeCompetition {
  return {
    id: assignment.competitions.id,
    name: assignment.competitions.name,
    category: assignment.competitions.category,
    noticeMode: assignment.competitions.notice_mode,
    noticePeriod: assignment.competitions.notice_period,
    startsAt: assignment.competitions.starts_at,
    endsAt: assignment.competitions.ends_at,
  };
}

function mapStudent(row: NoticeStudentRow): NoticeStudent {
  return {
    id: row.id,
    studentCode: row.student_code,
    name: getStudentName(row),
    className: row.class_name,
    gradeLevel: row.grade_level,
    status: row.status,
    competitionAssignments: (row.student_competitions ?? [])
      .filter((assignment) => assignment.status !== "withdrawn")
      .filter(
        (
          assignment,
        ): assignment is NoticeStudentCompetitionRow & {
          competitions: NonNullable<
            NoticeStudentCompetitionRow["competitions"]
          >;
        } => assignment.competitions !== null,
      )
      .map((assignment) => ({
        id: assignment.id,
        status: assignment.status,
        registeredAt: assignment.registered_at,
        competition: mapCompetition(assignment),
      })),
  };
}

export async function listNoticeStudents(): Promise<NoticeStudent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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
          id,
          status,
          registered_at,
          competitions (
            id,
            name,
            category,
            notice_mode,
            notice_period,
            starts_at,
            ends_at
          )
        )
      `,
    )
    .eq("status", "active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load parent notice students: ${error.message}`);
  }

  return ((data ?? []) as unknown as NoticeStudentRow[]).map(mapStudent);
}
