import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  NoticeCompetition,
  NoticeStudent,
  NoticeStudentCompetitionRow,
  NoticeStudentRow,
  TrainingNoticeActivity,
  TrainingNoticeActivityRow,
  TrainingNoticeParticipantRow,
  TrainingNoticeStudent,
  TrainingNoticeStudentRow,
} from "./types";

function getStudentName(
  row: Pick<
    NoticeStudentRow | TrainingNoticeStudentRow,
    "display_name" | "first_name" | "last_name"
  >,
) {
  return (
    row.display_name ??
    [row.first_name, row.last_name].filter(Boolean).join(" ")
  );
}

function mapTrainingStudent(
  assignment: TrainingNoticeParticipantRow,
  student: TrainingNoticeStudentRow,
): TrainingNoticeStudent {
  return {
    id: student.id,
    studentCode: student.student_code,
    name: getStudentName(student),
    className: student.class_name,
    gradeLevel: student.grade_level,
    status: student.status,
    assignmentId: assignment.id,
    assignmentStatus: assignment.status,
  };
}

function mapTrainingActivity(
  row: TrainingNoticeActivityRow,
  participantsByActivityId: Map<string, TrainingNoticeStudent[]>,
): TrainingNoticeActivity {
  return {
    id: row.id,
    competitionId: row.competition_id,
    name: row.name,
    activityType: row.activity_type,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    competition: row.competitions
      ? {
          id: row.competitions.id,
          name: row.competitions.name,
          shortName: row.competitions.short_name,
          color: row.competitions.color,
        }
      : null,
    participants: participantsByActivityId.get(row.id) ?? [],
  };
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

export async function listTrainingNoticeActivities(): Promise<
  TrainingNoticeActivity[]
> {
  const supabase = await createSupabaseServerClient();
  const { data: activityData, error: activityError } = await supabase
    .from("activities")
    .select(
      `
        id,
        competition_id,
        name,
        activity_type,
        status,
        starts_at,
        ends_at,
        location,
        competitions (
          id,
          name,
          short_name,
          color
        )
      `,
    )
    .neq("status", "cancelled")
    .neq("status", "archived")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (activityError) {
    throw new Error(
      `Unable to load training notice activities: ${activityError.message}`,
    );
  }

  const activities = (activityData ?? []) as unknown as TrainingNoticeActivityRow[];
  const activityIds = activities.map((activity) => activity.id);

  if (activityIds.length === 0) {
    return [];
  }

  const { data: participantData, error: participantError } = await supabase
    .from("activity_participants")
    .select("id,activity_id,student_id,status,assigned_at")
    .in("activity_id", activityIds)
    .neq("status", "cancelled")
    .order("assigned_at", { ascending: true });

  if (participantError) {
    throw new Error(
      `Unable to load training notice participants: ${participantError.message}`,
    );
  }

  const participantRows =
    (participantData ?? []) as unknown as TrainingNoticeParticipantRow[];
  const studentIds = [...new Set(participantRows.map((row) => row.student_id))];

  if (studentIds.length === 0) {
    return activities.map((activity) => mapTrainingActivity(activity, new Map()));
  }

  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .select(
      "id,student_code,first_name,last_name,display_name,class_name,grade_level,status",
    )
    .in("id", studentIds)
    .eq("status", "active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (studentError) {
    throw new Error(
      `Unable to load training notice student details: ${studentError.message}`,
    );
  }

  const studentsById = new Map(
    ((studentData ?? []) as unknown as TrainingNoticeStudentRow[]).map(
      (student) => [student.id, student],
    ),
  );
  const participantsByActivityId = new Map<string, TrainingNoticeStudent[]>();

  participantRows.forEach((participant) => {
    const student = studentsById.get(participant.student_id);

    if (!student) {
      return;
    }

    const participants = participantsByActivityId.get(participant.activity_id) ?? [];
    participants.push(mapTrainingStudent(participant, student));
    participantsByActivityId.set(participant.activity_id, participants);
  });

  return activities.map((activity) =>
    mapTrainingActivity(activity, participantsByActivityId),
  );
}
