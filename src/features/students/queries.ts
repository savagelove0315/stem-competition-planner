import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Competition,
  Student,
  StudentCompetitionStatus,
  StudentStatus,
} from "@/types/database";

type StudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  email: string | null;
  phone: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  parent_contact: string | null;
  status: StudentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student_competitions: StudentCompetitionJoinRow[] | null;
};

type StudentCompetitionJoinRow = {
  id: string;
  student_id: string;
  competition_id: string;
  status: StudentCompetitionStatus;
  registered_at: string;
  withdrawn_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  competitions: CompetitionRow | null;
};

type CompetitionRow = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  icon: string | null;
  category: string | null;
  notice_mode: string | null;
  notice_period: string | null;
  description: string | null;
  status: Competition["status"];
  starts_at: string | null;
  ends_at: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  lead_teacher_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentCompetitionAssignment = {
  id: string;
  studentId: string;
  competitionId: string;
  status: StudentCompetitionStatus;
  registeredAt: string;
  withdrawnAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  competition: Competition;
};

export type StudentWithCompetitions = Student & {
  competitionAssignments: StudentCompetitionAssignment[];
};

export type StudentCompetitionOption = Pick<
  Competition,
  "id" | "name" | "shortName" | "color" | "status"
>;

function mapCompetition(row: CompetitionRow): Competition {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    icon: row.icon,
    category: row.category,
    noticeMode: row.notice_mode,
    noticePeriod: row.notice_period,
    description: row.description,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    registrationOpensAt: row.registration_opens_at,
    registrationClosesAt: row.registration_closes_at,
    leadTeacherId: row.lead_teacher_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStudent(row: StudentRow): StudentWithCompetitions {
  return {
    id: row.id,
    studentCode: row.student_code,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    className: row.class_name,
    gradeLevel: row.grade_level,
    email: row.email,
    phone: row.phone,
    guardianName: row.guardian_name,
    guardianContact: row.guardian_contact,
    parentContact: row.parent_contact,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    competitionAssignments: (row.student_competitions ?? [])
      .filter((assignment) => assignment.status !== "withdrawn")
      .filter(
        (
          assignment,
        ): assignment is StudentCompetitionJoinRow & {
          competitions: CompetitionRow;
        } => assignment.competitions !== null,
      )
      .map((assignment) => ({
        id: assignment.id,
        studentId: assignment.student_id,
        competitionId: assignment.competition_id,
        status: assignment.status,
        registeredAt: assignment.registered_at,
        withdrawnAt: assignment.withdrawn_at,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        competition: mapCompetition(assignment.competitions),
      })),
  };
}

export async function listStudents(): Promise<StudentWithCompetitions[]> {
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
        email,
        phone,
        guardian_name,
        guardian_contact,
        parent_contact,
        status,
        notes,
        created_at,
        updated_at,
        student_competitions (
          id,
          student_id,
          competition_id,
          status,
          registered_at,
          withdrawn_at,
          notes,
          created_at,
          updated_at,
          competitions (
            id,
            name,
            short_name,
            color,
            icon,
            category,
            notice_mode,
            notice_period,
            description,
            status,
            starts_at,
            ends_at,
            registration_opens_at,
            registration_closes_at,
            lead_teacher_id,
            notes,
            created_at,
            updated_at
          )
        )
      `,
    )
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load students: ${error.message}`);
  }

  return ((data ?? []) as unknown as StudentRow[]).map(mapStudent);
}

export async function listStudentCompetitionOptions(): Promise<
  StudentCompetitionOption[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id,name,short_name,color,status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load competition options: ${error.message}`);
  }

  return ((data ?? []) as unknown as Array<{
    id: string;
    name: string;
    short_name: string | null;
    color: string;
    status: Competition["status"];
  }>).map((competition) => ({
    id: competition.id,
    name: competition.name,
    shortName: competition.short_name,
    color: competition.color,
    status: competition.status,
  }));
}
