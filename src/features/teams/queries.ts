import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team, TeamMember, TeamMemberStatus, TeamStatus } from "@/types/database";

type TeamRow = {
  id: string;
  competition_id: string;
  name: string;
  team_code: string | null;
  status: TeamStatus;
  coach_teacher_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type TeamMemberRow = {
  id: string;
  team_id: string;
  competition_id: string;
  student_id: string;
  role: string | null;
  status: TeamMemberStatus;
  joined_at: string;
  left_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type TeamMemberStudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: string;
};

export type CompetitionTeamMemberStudent = {
  id: string;
  studentCode: string | null;
  name: string;
  className: string | null;
  gradeLevel: string | null;
  status: string;
};

export type CompetitionTeamMember = TeamMember & {
  student: CompetitionTeamMemberStudent | null;
};

export type CompetitionTeam = Team & {
  members: CompetitionTeamMember[];
};

function mapTeam(row: TeamRow): CompetitionTeam {
  return {
    id: row.id,
    competitionId: row.competition_id,
    name: row.name,
    teamCode: row.team_code,
    status: row.status,
    coachTeacherId: row.coach_teacher_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    members: [],
  };
}

function mapTeamMember(
  row: TeamMemberRow,
  studentsById: Map<string, CompetitionTeamMemberStudent>,
): CompetitionTeamMember {
  return {
    id: row.id,
    teamId: row.team_id,
    competitionId: row.competition_id,
    studentId: row.student_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    leftAt: row.left_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    student: studentsById.get(row.student_id) ?? null,
  };
}

function mapStudent(row: TeamMemberStudentRow): CompetitionTeamMemberStudent {
  return {
    id: row.id,
    studentCode: row.student_code,
    name:
      row.display_name ??
      [row.first_name, row.last_name].filter(Boolean).join(" "),
    className: row.class_name,
    gradeLevel: row.grade_level,
    status: row.status,
  };
}

async function loadStudentsById(studentIds: string[]) {
  if (studentIds.length === 0) {
    return new Map<string, CompetitionTeamMemberStudent>();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id,student_code,first_name,last_name,display_name,class_name,grade_level,status",
    )
    .in("id", studentIds);

  if (error) {
    throw new Error(`Unable to load team member student details: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as unknown as TeamMemberStudentRow[]).map((row) => {
      const student = mapStudent(row);
      return [student.id, student];
    }),
  );
}

export async function listCompetitionTeams(): Promise<CompetitionTeam[]> {
  const supabase = await createSupabaseServerClient();
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select(
      "id,competition_id,name,team_code,status,coach_teacher_id,notes,created_at,updated_at",
    )
    .order("name", { ascending: true });

  if (teamError) {
    throw new Error(`Unable to load competition teams: ${teamError.message}`);
  }

  const teams = ((teamData ?? []) as unknown as TeamRow[]).map(mapTeam);

  if (teams.length === 0) {
    return [];
  }

  const competitionIds = [...new Set(teams.map((team) => team.competitionId))];
  const { data: memberData, error: memberError } = await supabase
    .from("team_members")
    .select(
      "id,team_id,competition_id,student_id,role,status,joined_at,left_at,notes,created_at,updated_at",
    )
    .eq("status", "active")
    .in("competition_id", competitionIds)
    .order("joined_at", { ascending: true });

  if (memberError) {
    throw new Error(`Unable to load team members: ${memberError.message}`);
  }

  const memberRows = (memberData ?? []) as unknown as TeamMemberRow[];
  const studentsById = await loadStudentsById([
    ...new Set(memberRows.map((member) => member.student_id)),
  ]);
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  memberRows.forEach((row) => {
    const team = teamsById.get(row.team_id);

    if (team) {
      team.members.push(mapTeamMember(row, studentsById));
    }
  });

  return teams;
}
