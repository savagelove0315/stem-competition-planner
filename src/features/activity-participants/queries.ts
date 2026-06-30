import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ActivityParticipant,
  ActivityParticipantStatus,
  StudentStatus,
} from "@/types/database";

type StudentCompetitionRow = {
  competition_id: string;
  status: string;
};

type StudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: StudentStatus;
  student_competitions: StudentCompetitionRow[] | null;
};

type ActivityParticipantRow = {
  id: string;
  activity_id: string;
  competition_id: string;
  student_id: string;
  role: string | null;
  status: ActivityParticipantStatus;
  assigned_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityParticipantStudentOption = {
  id: string;
  studentCode: string | null;
  name: string;
  className: string | null;
  gradeLevel: string | null;
  status: StudentStatus;
  registeredCompetitionIds: string[];
  activeCompetitionCount: number;
  isMultiCompetition: boolean;
};

export type ActivityParticipantAssignment = ActivityParticipant & {
  student: ActivityParticipantStudentOption | null;
};

function getStudentName(row: Pick<StudentRow, "display_name" | "first_name" | "last_name">) {
  return (
    row.display_name ??
    [row.first_name, row.last_name].filter(Boolean).join(" ")
  );
}

function getRegisteredCompetitionIds(row: StudentRow) {
  return (row.student_competitions ?? [])
    .filter((assignment) => assignment.status !== "withdrawn")
    .map((assignment) => assignment.competition_id);
}

function mapStudentOption(row: StudentRow): ActivityParticipantStudentOption {
  const registeredCompetitionIds = getRegisteredCompetitionIds(row);

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

function mapActivityParticipant(
  row: ActivityParticipantRow,
  studentsById: Map<string, ActivityParticipantStudentOption>,
): ActivityParticipantAssignment {
  return {
    id: row.id,
    activityId: row.activity_id,
    competitionId: row.competition_id,
    studentId: row.student_id,
    role: row.role,
    status: row.status,
    assignedAt: row.assigned_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    student: studentsById.get(row.student_id) ?? null,
  };
}

export async function listActivityParticipants(): Promise<
  ActivityParticipantAssignment[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity_participants")
    .select(
      "id,activity_id,competition_id,student_id,role,status,assigned_at,notes,created_at,updated_at",
    )
    .neq("status", "cancelled")
    .order("assigned_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load activity participants: ${error.message}`);
  }

  const participantRows = (data ?? []) as unknown as ActivityParticipantRow[];
  const studentIds = [...new Set(participantRows.map((row) => row.student_id))];

  if (studentIds.length === 0) {
    return participantRows.map((row) => mapActivityParticipant(row, new Map()));
  }

  const { data: studentData, error: studentError } = await supabase
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
    .in("id", studentIds);

  if (studentError) {
    throw new Error(
      `Unable to load participant student details: ${studentError.message}`,
    );
  }

  const studentsById = new Map(
    ((studentData ?? []) as unknown as StudentRow[]).map((student) => {
      const option = mapStudentOption(student);
      return [option.id, option];
    }),
  );

  return participantRows.map((row) => mapActivityParticipant(row, studentsById));
}

export async function listActivityParticipantStudentOptions(): Promise<
  ActivityParticipantStudentOption[]
> {
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
          competition_id,
          status
        )
      `,
    )
    .eq("status", "active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load student options: ${error.message}`);
  }

  return ((data ?? []) as unknown as StudentRow[]).map(mapStudentOption);
}
