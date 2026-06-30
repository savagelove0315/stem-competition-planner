import type {
  ActivityParticipantStatus,
  ActivityStatus,
  CompetitionStatus,
  StudentCompetitionStatus,
  StudentStatus,
} from "@/types/database";

export type ConflictDetectionSeverity = "serious" | "mild" | "warning";

export type ConflictFilters = {
  month: string | null;
  startDate: string | null;
  endDate: string | null;
  competitionId: string | null;
  severity: ConflictDetectionSeverity | null;
  gradeLevel: string | null;
  className: string | null;
  onlyMultiCompetition: boolean;
};

export type ConflictCompetition = {
  id: string;
  name: string;
  shortName: string | null;
  color: string;
  status: CompetitionStatus;
};

export type ConflictStudent = {
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

export type ConflictActivity = {
  id: string;
  competitionId: string;
  name: string;
  activityType: string | null;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  competition: ConflictCompetition | null;
};

export type ConflictAssignment = {
  id: string;
  activityId: string;
  competitionId: string;
  studentId: string;
  status: ActivityParticipantStatus;
  assignedAt: string;
  activity: ConflictActivity | null;
};

export type ConflictData = {
  students: ConflictStudent[];
  assignments: ConflictAssignment[];
  competitions: ConflictCompetition[];
};

export type ActivityConflictSide = {
  assignmentId: string;
  activityId: string;
  activityName: string;
  competitionId: string;
  competitionName: string;
  competitionLabel: string;
  competitionColor: string;
  timeLabel: string;
  startsAt: string | null;
  endsAt: string | null;
};

export type DetectedConflict = {
  id: string;
  student: ConflictStudent;
  conflictDateLabel: string;
  conflictStartDate: string;
  conflictEndDate: string;
  severity: ConflictDetectionSeverity;
  reason: string;
  suggestedAction: string;
  activityOne: ActivityConflictSide;
  activityTwo: ActivityConflictSide;
};

export type ConflictViewModel = {
  conflicts: DetectedConflict[];
  summary: {
    totalConflicts: number;
    seriousConflicts: number;
    mildConflicts: number;
    warningConflicts: number;
    studentsAffected: number;
    highRiskDates: number;
  };
  filterOptions: {
    competitions: ConflictCompetition[];
    gradeLevels: string[];
    classNames: string[];
  };
  hasParticipantData: boolean;
  bufferMinutes: number;
};

export type ConflictCompetitionRow = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  status: CompetitionStatus;
};

export type ConflictStudentCompetitionRow = {
  competition_id: string;
  status: StudentCompetitionStatus;
};

export type ConflictStudentRow = {
  id: string;
  student_code: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  class_name: string | null;
  grade_level: string | null;
  status: StudentStatus;
  student_competitions: ConflictStudentCompetitionRow[] | null;
};

export type ConflictActivityRow = {
  id: string;
  competition_id: string;
  name: string;
  activity_type: string | null;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  competitions: ConflictCompetitionRow | null;
};

export type ConflictAssignmentRow = {
  id: string;
  activity_id: string;
  competition_id: string;
  student_id: string;
  status: ActivityParticipantStatus;
  assigned_at: string;
  activities: ConflictActivityRow | null;
};
