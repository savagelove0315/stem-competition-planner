import type {
  ActivityStatus,
  CompetitionStatus,
} from "@/types/database";

export type TimelineViewMode = "competition" | "activity";
export type TimelineDensity = "comfortable" | "compact" | "mini";

export type TimelineFilters = {
  view: TimelineViewMode;
  density: TimelineDensity;
  month: string | null;
  startDate: string | null;
  endDate: string | null;
  competitionId: string | null;
  activityStatus: ActivityStatus | null;
  activityType: string | null;
};

export type TimelineCompetition = {
  id: string;
  name: string;
  shortName: string | null;
  color: string;
  status: CompetitionStatus;
};

export type TimelineActivity = {
  id: string;
  competitionId: string;
  name: string;
  activityType: string | null;
  status: ActivityStatus;
  startsAt: string | null;
  endsAt: string | null;
  participantCount: number;
  competition: TimelineCompetition | null;
};

export type TimelineData = {
  competitions: TimelineCompetition[];
  activities: TimelineActivity[];
};

export type TimelineDateColumn = {
  key: string;
  dayNumber: string;
  weekday: string;
  dateLabel: string;
};

export type TimelineCellActivity = {
  id: string;
  name: string;
  competitionLabel: string;
  competitionColor: string;
  activityType: string | null;
  status: ActivityStatus;
  dateTimeLabel: string;
  participantCount: number;
};

export type TimelineCompetitionRow = {
  kind: "competition";
  id: string;
  label: string;
  description: string;
  color: string;
  cells: Record<string, TimelineCellActivity[]>;
};

export type TimelineActivityRow = {
  kind: "activity";
  id: string;
  label: string;
  description: string;
  color: string;
  cells: Record<string, TimelineCellActivity[]>;
};

export type TimelineRow = TimelineCompetitionRow | TimelineActivityRow;

export type TimelineViewModel = {
  view: TimelineViewMode;
  density: TimelineDensity;
  rows: TimelineRow[];
  dateColumns: TimelineDateColumn[];
  summary: {
    competitionsShown: number;
    activitiesShown: number;
    upcomingActivities: number;
    participantAssignments: number;
    dateRangeLabel: string;
  };
  filterOptions: {
    competitions: TimelineCompetition[];
    activityStatuses: ActivityStatus[];
    activityTypes: string[];
  };
  hasActivities: boolean;
};

export type TimelineCompetitionRowData = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  status: CompetitionStatus;
};

export type TimelineActivityRowData = {
  id: string;
  competition_id: string;
  name: string;
  activity_type: string | null;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  competitions: TimelineCompetitionRowData | null;
};

export type TimelineParticipantRowData = {
  activity_id: string;
  status: string;
};
