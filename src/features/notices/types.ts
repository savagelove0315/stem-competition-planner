import type {
  ActivityParticipantStatus,
  ActivityStatus,
  StudentCompetitionStatus,
  StudentStatus,
} from "@/types/database";

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

export type NoticeStudentFilters = {
  className: string;
  gradeLevel: string;
  competitionId: string;
  onlyWithCompetitions: boolean;
  onlyMultiCompetition: boolean;
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

export type TrainingNoticeCompetition = {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
};

export type TrainingNoticeStudent = {
  id: string;
  studentCode: string | null;
  name: string;
  className: string | null;
  gradeLevel: string | null;
  status: StudentStatus;
  assignmentId: string;
  assignmentStatus: ActivityParticipantStatus;
};

export type TrainingNoticeActivity = {
  id: string;
  competitionId: string;
  name: string;
  activityType: string | null;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  competition: TrainingNoticeCompetition | null;
  participants: TrainingNoticeStudent[];
};

export type TrainingNoticeActivityFilters = {
  competitionId: string;
  activityType: string;
  search: string;
};

export type TrainingNoticeActivityRow = {
  id: string;
  competition_id: string;
  name: string;
  activity_type: string | null;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  competitions: {
    id: string;
    name: string;
    short_name: string | null;
    color: string | null;
  } | null;
};

export type TrainingNoticeParticipantRow = {
  id: string;
  activity_id: string;
  student_id: string;
  status: ActivityParticipantStatus;
  assigned_at: string;
};

export type TrainingNoticeStudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: StudentStatus;
};
