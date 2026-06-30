import type {
  ActivityStatus,
  CompetitionStatus,
} from "@/types/database";
import type {
  ConflictDetectionSeverity,
  ConflictReviewStatus,
} from "@/features/conflicts/types";

export type ReportType =
  | "competition"
  | "student-workload"
  | "activity-schedule"
  | "conflicts"
  | "class-grade";

export type WorkloadLevel = "normal" | "busy" | "high risk";

export type ReportFilters = {
  report: ReportType;
  month: string | null;
  startDate: string | null;
  endDate: string | null;
  competitionId: string | null;
  gradeLevel: string | null;
  className: string | null;
  activityStatus: ActivityStatus | null;
};

export type ReportCompetitionOption = {
  id: string;
  name: string;
  shortName: string | null;
  color: string;
  status: CompetitionStatus;
};

export type ReportFilterOptions = {
  competitions: ReportCompetitionOption[];
  gradeLevels: string[];
  classNames: string[];
};

export type ReportSummaryCard = {
  label: string;
  value: number | string;
};

export type CompetitionParticipationReportRow = {
  competitionId: string;
  competitionName: string;
  competitionLabel: string;
  competitionColor: string;
  status: CompetitionStatus;
  enrolledStudentCount: number;
  activityCount: number;
  participantAssignmentCount: number;
  multiCompetitionStudentCount: number;
  upcomingActivityCount: number;
};

export type StudentWorkloadReportRow = {
  studentId: string;
  studentName: string;
  studentCode: string | null;
  className: string | null;
  gradeLevel: string | null;
  competitionCount: number;
  activitiesAssignedCount: number;
  upcomingActivitiesCount: number;
  unresolvedConflictsCount: number;
  hasUnresolvedSeriousConflict: boolean;
  workloadLevel: WorkloadLevel;
};

export type ActivityScheduleReportRow = {
  activityId: string;
  activityName: string;
  competitionName: string;
  competitionLabel: string;
  competitionColor: string;
  activityType: string | null;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  dateTimeLabel: string;
  participantCount: number;
  timingStatus: "upcoming" | "past" | "unscheduled";
};

export type ConflictStatusReport = {
  totalDetectedConflicts: number;
  seriousConflicts: number;
  mildConflicts: number;
  warningConflicts: number;
  unreviewedConflicts: number;
  reviewedConflicts: number;
  resolvedConflicts: number;
  affectedStudents: number;
  seriousUnresolvedConflicts: number;
  conflicts: ConflictStatusReportRow[];
};

export type ConflictStatusReportRow = {
  id: string;
  studentName: string;
  className: string | null;
  gradeLevel: string | null;
  conflictDateLabel: string;
  activityOneName: string;
  activityTwoName: string;
  severity: ConflictDetectionSeverity;
  reviewStatus: ConflictReviewStatus;
};

export type ClassGradeParticipationReportRow = {
  id: string;
  className: string | null;
  gradeLevel: string | null;
  studentsInvolved: number;
  competitionRegistrations: number;
  activityAssignments: number;
  unresolvedConflicts: number;
};

export type ReportsViewModel = {
  filters: ReportFilters;
  filterOptions: ReportFilterOptions;
  summaryCards: ReportSummaryCard[];
  competitionRows: CompetitionParticipationReportRow[];
  studentWorkloadRows: StudentWorkloadReportRow[];
  activityScheduleRows: ActivityScheduleReportRow[];
  conflictStatus: ConflictStatusReport;
  classGradeRows: ClassGradeParticipationReportRow[];
};
