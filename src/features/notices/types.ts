import type { StudentCompetitionStatus, StudentStatus } from "@/types/database";

export type NoticeCompetition = {
  id: string;
  name: string;
  category: string | null;
  noticeMode: string | null;
  noticePeriod: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

export type NoticeCompetitionAssignment = {
  id: string;
  status: StudentCompetitionStatus;
  registeredAt: string;
  competition: NoticeCompetition;
};

export type NoticeStudent = {
  id: string;
  studentCode: string | null;
  name: string;
  className: string | null;
  gradeLevel: string | null;
  status: StudentStatus;
  competitionAssignments: NoticeCompetitionAssignment[];
};

export type NoticeCompetitionRow = {
  id: string;
  name: string;
  category: string | null;
  notice_mode: string | null;
  notice_period: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export type NoticeStudentCompetitionRow = {
  id: string;
  status: StudentCompetitionStatus;
  registered_at: string;
  competitions: NoticeCompetitionRow | null;
};

export type NoticeStudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: StudentStatus;
  student_competitions: NoticeStudentCompetitionRow[] | null;
};
