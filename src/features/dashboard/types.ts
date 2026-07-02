import type {
  ActivityStatus,
  CompetitionStatus,
  StudentStatus,
} from "@/types/database";
import type { DetectedConflict } from "@/features/conflicts/types";

export type DashboardCompetition = {
  id: string;
  name: string;
  shortName: string | null;
  color: string;
  status: CompetitionStatus;
};

export type DashboardStudent = {
  id: string;
  name: string;
  className: string | null;
  gradeLevel: string | null;
  status: StudentStatus;
  registeredCompetitionIds: string[];
};

export type DashboardActivity = {
  id: string;
  competitionId: string;
  name: string;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  competition: DashboardCompetition | null;
};

export type DashboardActivityParticipant = {
  id: string;
  activityId: string;
  competitionId: string;
  studentId: string;
};

export type DashboardTeamMember = {
  id: string;
  teamId: string;
  competitionId: string;
  studentId: string;
  role: string | null;
  studentName: string;
};

export type DashboardTeam = {
  id: string;
  competitionId: string;
  name: string;
  status: string;
  members: DashboardTeamMember[];
};

export type DashboardData = {
  competitions: DashboardCompetition[];
  students: DashboardStudent[];
  activities: DashboardActivity[];
  activityParticipants: DashboardActivityParticipant[];
  teams: DashboardTeam[];
  conflicts: DetectedConflict[];
};

export type DashboardSummary = {
  activeCompetitions: number;
  activeStudents: number;
  upcomingActivities: number;
  multiCompetitionStudents: number;
  unresolvedConflicts: number;
  seriousUnresolvedConflicts: number;
};

export type UpcomingActivityOverview = DashboardActivity & {
  startsAt: string;
  participantCount: number;
};

export type CompetitionOverview = DashboardCompetition & {
  enrolledStudentCount: number;
  activityCount: number;
  upcomingActivityCount: number;
  participantAssignmentCount: number;
  teamCount: number;
  teams: DashboardTeam[];
  unassignedStudents: DashboardStudent[];
};

export type StudentWorkloadOverview = DashboardStudent & {
  competitionCount: number;
  upcomingActivityCount: number;
};

export type DashboardViewModel = {
  summary: DashboardSummary;
  upcomingActivities: UpcomingActivityOverview[];
  unresolvedConflicts: DetectedConflict[];
  competitionOverviews: CompetitionOverview[];
  studentWorkloads: StudentWorkloadOverview[];
  hasCompetitions: boolean;
  hasStudents: boolean;
  hasActivities: boolean;
  hasConflicts: boolean;
};
