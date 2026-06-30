import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Student,
  StudentCompetition,
  StudentCompetitionStatus,
  StudentStatus,
} from "@/types/database";

type StudentCompetitionRow = {
  competition_id: string;
  status: StudentCompetitionStatus;
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

type EnrollmentRow = {
  id: string;
  student_id: string;
  competition_id: string;
  status: StudentCompetitionStatus;
  registered_at: string;
  withdrawn_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CompetitionEnrollmentStudent = Pick<
  Student,
  "id" | "studentCode" | "className" | "gradeLevel" | "status"
> & {
  name: string;
  registeredCompetitionIds: string[];
  activeCompetitionCount: number;
  isMultiCompetition: boolean;
};

export type CompetitionEnrollment = StudentCompetition & {
  student: CompetitionEnrollmentStudent | null;
};

export type CompetitionEnrollmentCount = {
  competitionId: string;
  enrolledCount: number;
};

function getStudentName(
  row: Pick<StudentRow, "display_name" | "first_name" | "last_name">,
) {
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

function mapStudent(row: StudentRow): CompetitionEnrollmentStudent {
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

function mapEnrollment(
  row: EnrollmentRow,
  studentsById: Map<string, CompetitionEnrollmentStudent>,
): CompetitionEnrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    competitionId: row.competition_id,
    status: row.status,
    registeredAt: row.registered_at,
    withdrawnAt: row.withdrawn_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    student: studentsById.get(row.student_id) ?? null,
  };
}

async function loadStudentsById(studentIds: string[]) {
  if (studentIds.length === 0) {
    return new Map<string, CompetitionEnrollmentStudent>();
  }

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
    .in("id", studentIds);

  if (error) {
    throw new Error(`Unable to load enrolled student details: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as unknown as StudentRow[]).map((student) => {
      const mappedStudent = mapStudent(student);
      return [mappedStudent.id, mappedStudent];
    }),
  );
}

export async function listCompetitionEnrollments(): Promise<
  CompetitionEnrollment[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("student_competitions")
    .select(
      "id,student_id,competition_id,status,registered_at,withdrawn_at,notes,created_at,updated_at",
    )
    .neq("status", "withdrawn")
    .order("registered_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load competition enrollments: ${error.message}`);
  }

  const enrollmentRows = (data ?? []) as unknown as EnrollmentRow[];
  const studentIds = [...new Set(enrollmentRows.map((row) => row.student_id))];
  const studentsById = await loadStudentsById(studentIds);

  return enrollmentRows.map((row) => mapEnrollment(row, studentsById));
}

export async function listCompetitionEnrollmentCounts(): Promise<
  CompetitionEnrollmentCount[]
> {
  const enrollments = await listCompetitionEnrollments();
  const countsByCompetition = new Map<string, number>();

  enrollments.forEach((enrollment) => {
    countsByCompetition.set(
      enrollment.competitionId,
      (countsByCompetition.get(enrollment.competitionId) ?? 0) + 1,
    );
  });

  return [...countsByCompetition.entries()].map(
    ([competitionId, enrolledCount]) => ({
      competitionId,
      enrolledCount,
    }),
  );
}

export async function listCompetitionEnrollmentStudentOptions(): Promise<
  CompetitionEnrollmentStudent[]
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
    throw new Error(`Unable to load active student options: ${error.message}`);
  }

  return ((data ?? []) as unknown as StudentRow[]).map(mapStudent);
}
