import type {
  ActivityParticipantStatus,
  ActivityStatus,
  CompetitionStatus,
  StudentCompetitionStatus,
  StudentStatus,
} from "@/types/database";

export type StudentTimelineFilters = {
  month: string | null;
  startDate: string | null;
  endDate: string | null;
  competitionId: string | null;
  gradeLevel: string | null;
  className: string | null;
  onlyMultiCompetition: boolean;
};

export type StudentTimelineCompetition = {
  id: string;
  name: string;
  shortName: string | null;
  color: string;
  status: CompetitionStatus;
};

export type StudentTimelineStudent = {
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

export type StudentTimelineActivity = {
  id: string;
  competitionId: string;
  name: string;
  activityType: string | null;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  competition: StudentTimelineCompetition | null;
};

export type StudentTimelineAssignment = {
  id: string;
  activityId: string;
  competitionId: string;
  studentId: string;
  status: ActivityParticipantStatus;
  assignedAt: string;
  activity: StudentTimelineActivity | null;
};

export type StudentTimelineData = {
  students: StudentTimelineStudent[];
  assignments: StudentTimelineAssignment[];
  competitions: StudentTimelineCompetition[];
};

export type StudentTimelineDateColumn = {
  key: string;
  dayNumber: string;
  weekday: string;
  dateLabel: string;
};

export type StudentTimelineCellActivity = {
  assignmentId: string;
  activityId: string;
  name: string;
  competitionLabel: string;
  competitionColor: string;
  activityType: string | null;
  status: ActivityStatus | null;
  timeLabel: string | null;
};

export type StudentTimelineRow = {
  student: StudentTimelineStudent;
  cells: Record<string, StudentTimelineCellActivity[]>;
  activityCount: number;
};

export type StudentTimelineViewModel = {
  rows: StudentTimelineRow[];
  dateColumns: StudentTimelineDateColumn[];
  summary: {
    studentsShown: number;
    activitiesShown: number;
    dateRangeLabel: string;
    multiCompetitionStudents: number;
  };
  filterOptions: {
    competitions: StudentTimelineCompetition[];
    gradeLevels: string[];
    classNames: string[];
  };
  hasParticipantData: boolean;
};

export type StudentTimelineCompetitionRow = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  status: CompetitionStatus;
};

export type StudentTimelineStudentCompetitionRow = {
  competition_id: string;
  status: StudentCompetitionStatus;
};

export type StudentTimelineStudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: StudentStatus;
  student_competitions: StudentTimelineStudentCompetitionRow[] | null;
};

export type StudentTimelineActivityRow = {
  id: string;
  competition_id: string;
  name: string;
  activity_type: string | null;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  competitions: StudentTimelineCompetitionRow | null;
};

export type StudentTimelineAssignmentRow = {
  id: string;
  activity_id: string;
  competition_id: string;
  student_id: string;
  status: ActivityParticipantStatus;
  assigned_at: string;
  activities: StudentTimelineActivityRow | null;
};
