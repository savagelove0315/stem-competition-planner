import { z } from "zod";

import type { ActivityStatus } from "@/types/database";
import type {
  TimelineActivity,
  TimelineCellActivity,
  TimelineCompetition,
  TimelineDateColumn,
  TimelineFilters,
  TimelineRow,
  TimelineViewMode,
  TimelineViewModel,
} from "@/features/timeline/types";

const activityStatuses: ActivityStatus[] = [
  "draft",
  "planned",
  "active",
  "completed",
  "cancelled",
  "archived",
];

const TIMELINE_LOCALE = "en-US";
const TIMELINE_TIME_ZONE = "UTC";

const dateValueSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .catch("");

const monthValueSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}$/)
  .catch("");

const timelineFilterSchema = z
  .object({
    view: z.enum(["competition", "activity"]).catch("competition"),
    month: monthValueSchema,
    startDate: dateValueSchema,
    endDate: dateValueSchema,
    competitionId: z.string().trim().catch(""),
    activityStatus: z.enum(activityStatuses).or(z.literal("")).catch(""),
    activityType: z.string().trim().catch(""),
  })
  .transform((value) => {
    const month = value.month || null;
    const monthRange = month ? getMonthRange(month) : null;
    const startDate = value.startDate || monthRange?.startDate || null;
    const endDate = value.endDate || monthRange?.endDate || null;

    return {
      view: value.view,
      month,
      startDate,
      endDate,
      competitionId: value.competitionId || null,
      activityStatus: value.activityStatus || null,
      activityType: value.activityType || null,
    } satisfies TimelineFilters;
  });

export function parseTimelineFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TimelineFilters {
  return timelineFilterSchema.parse({
    view: getSearchParam(searchParams.view),
    month: getSearchParam(searchParams.month),
    startDate: getSearchParam(searchParams.startDate),
    endDate: getSearchParam(searchParams.endDate),
    competitionId: getSearchParam(searchParams.competitionId),
    activityStatus: getSearchParam(searchParams.activityStatus),
    activityType: getSearchParam(searchParams.activityType),
  });
}

export function buildTimelineViewModel({
  competitions,
  activities,
  filters,
  renderedAt,
}: {
  competitions: TimelineCompetition[];
  activities: TimelineActivity[];
  filters: TimelineFilters;
  renderedAt: string;
}): TimelineViewModel {
  const filteredActivities = activities.filter((activity) =>
    doesActivityMatchFilters(activity, filters),
  );
  const scheduledActivities = filteredActivities.filter((activity) =>
    Boolean(activity.startsAt),
  );
  const dateColumns = buildDateColumns(scheduledActivities, filters);
  const dateKeys = new Set(dateColumns.map((column) => column.key));
  const visibleActivityIds = new Set<string>();
  const cellsByCompetition = buildEmptyCellsById(
    competitions.map((competition) => competition.id),
    dateColumns,
  );
  const cellsByActivity = buildEmptyCellsById(
    scheduledActivities.map((activity) => activity.id),
    dateColumns,
  );

  scheduledActivities.forEach((activity) => {
    const activityDateKeys = getActivityDateKeys(activity).filter((dateKey) =>
      dateKeys.has(dateKey),
    );

    if (activityDateKeys.length === 0) {
      return;
    }

    visibleActivityIds.add(activity.id);
    const cellActivity = mapCellActivity(activity);

    activityDateKeys.forEach((dateKey) => {
      const competitionCells = cellsByCompetition.get(activity.competitionId);
      const activityCells = cellsByActivity.get(activity.id);

      if (competitionCells) {
        competitionCells[dateKey] = [
          ...(competitionCells[dateKey] ?? []),
          cellActivity,
        ];
      }

      if (activityCells) {
        activityCells[dateKey] = [cellActivity];
      }
    });
  });

  const visibleActivities = scheduledActivities.filter((activity) =>
    visibleActivityIds.has(activity.id),
  );
  const visibleCompetitionIds = new Set(
    visibleActivities.map((activity) => activity.competitionId),
  );
  const rows =
    filters.view === "activity"
      ? buildActivityRows(visibleActivities, cellsByActivity)
      : buildCompetitionRows(competitions, visibleCompetitionIds, cellsByCompetition);

  return {
    view: filters.view,
    rows,
    dateColumns,
    summary: {
      competitionsShown: visibleCompetitionIds.size,
      activitiesShown: visibleActivities.length,
      upcomingActivities: visibleActivities.filter((activity) =>
        isUpcomingActivity(activity, renderedAt),
      ).length,
      participantAssignments: visibleActivities.reduce(
        (count, activity) => count + activity.participantCount,
        0,
      ),
      dateRangeLabel: formatDateRangeLabel(dateColumns),
    },
    filterOptions: {
      competitions,
      activityStatuses,
      activityTypes: getUniqueSortedValues(
        activities.map((activity) => activity.activityType),
      ),
    },
    hasActivities: activities.length > 0,
  };
}

export function buildTimelineViewHref(
  filters: TimelineFilters,
  view: TimelineViewMode,
) {
  const params = new URLSearchParams();
  params.set("view", view);
  setOptionalParam(params, "month", filters.month);
  setOptionalParam(params, "startDate", filters.startDate);
  setOptionalParam(params, "endDate", filters.endDate);
  setOptionalParam(params, "competitionId", filters.competitionId);
  setOptionalParam(params, "activityStatus", filters.activityStatus);
  setOptionalParam(params, "activityType", filters.activityType);

  return `/timeline?${params.toString()}`;
}

function buildCompetitionRows(
  competitions: TimelineCompetition[],
  visibleCompetitionIds: Set<string>,
  cellsByCompetition: Map<string, Record<string, TimelineCellActivity[]>>,
): TimelineRow[] {
  return competitions
    .filter((competition) => visibleCompetitionIds.has(competition.id))
    .map((competition) => ({
      kind: "competition",
      id: competition.id,
      label: competition.shortName ?? competition.name,
      description: competition.name,
      color: competition.color,
      cells: cellsByCompetition.get(competition.id) ?? {},
    }));
}

function buildActivityRows(
  activities: TimelineActivity[],
  cellsByActivity: Map<string, Record<string, TimelineCellActivity[]>>,
): TimelineRow[] {
  return activities.map((activity) => ({
    kind: "activity",
    id: activity.id,
    label: activity.name,
    description: activity.competition?.shortName ?? activity.competition?.name ?? "Competition",
    color: activity.competition?.color ?? "#64748b",
    cells: cellsByActivity.get(activity.id) ?? {},
  }));
}

function doesActivityMatchFilters(
  activity: TimelineActivity,
  filters: TimelineFilters,
) {
  if (filters.competitionId && activity.competitionId !== filters.competitionId) {
    return false;
  }

  if (filters.activityStatus) {
    if (activity.status !== filters.activityStatus) {
      return false;
    }
  } else if (activity.status === "archived" || activity.status === "cancelled") {
    return false;
  }

  if (filters.activityType && activity.activityType !== filters.activityType) {
    return false;
  }

  return doesActivityTouchDateRange(activity, filters);
}

function doesActivityTouchDateRange(
  activity: TimelineActivity,
  filters: TimelineFilters,
) {
  if (!filters.startDate && !filters.endDate) {
    return true;
  }

  const dateKeys = getActivityDateKeys(activity);

  if (dateKeys.length === 0) {
    return false;
  }

  const activityStart = dateKeys[0];
  const activityEnd = dateKeys[dateKeys.length - 1];
  const rangeStart = filters.startDate ?? activityStart;
  const rangeEnd = filters.endDate ?? activityEnd;

  return activityStart <= rangeEnd && activityEnd >= rangeStart;
}

function buildDateColumns(
  activities: TimelineActivity[],
  filters: TimelineFilters,
): TimelineDateColumn[] {
  const range = getTimelineDateRange(activities, filters);

  if (!range) {
    return [];
  }

  const columns: TimelineDateColumn[] = [];
  let currentDate = parseDateKey(range.startDate);
  const finalDate = parseDateKey(range.endDate);

  while (currentDate <= finalDate) {
    const key = toDateKey(currentDate);
    columns.push({
      key,
      dayNumber: new Intl.DateTimeFormat(TIMELINE_LOCALE, {
        day: "numeric",
        timeZone: TIMELINE_TIME_ZONE,
      }).format(currentDate),
      weekday: new Intl.DateTimeFormat(TIMELINE_LOCALE, {
        weekday: "short",
        timeZone: TIMELINE_TIME_ZONE,
      }).format(currentDate),
      dateLabel: new Intl.DateTimeFormat(TIMELINE_LOCALE, {
        month: "short",
        day: "numeric",
        timeZone: TIMELINE_TIME_ZONE,
      }).format(currentDate),
    });
    currentDate = addDays(currentDate, 1);
  }

  return columns;
}

function getTimelineDateRange(
  activities: TimelineActivity[],
  filters: TimelineFilters,
) {
  const activityDateKeys = activities.flatMap(getActivityDateKeys).sort();
  const startDate = filters.startDate ?? activityDateKeys[0] ?? null;
  const endDate = filters.endDate ?? activityDateKeys[activityDateKeys.length - 1] ?? null;

  if (!startDate || !endDate) {
    return null;
  }

  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate };
}

function getActivityDateKeys(activity: TimelineActivity) {
  if (!activity.startsAt) {
    return [];
  }

  const startDateKey = toDateKey(new Date(activity.startsAt));
  const endDateKey = activity.endsAt
    ? toDateKey(new Date(activity.endsAt))
    : startDateKey;
  const keys: string[] = [];
  let currentDate = parseDateKey(startDateKey);
  const finalDate = parseDateKey(endDateKey);

  while (currentDate <= finalDate) {
    keys.push(toDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return keys;
}

function mapCellActivity(activity: TimelineActivity): TimelineCellActivity {
  const competition = activity.competition;

  return {
    id: activity.id,
    name: activity.name,
    competitionLabel: competition?.shortName ?? competition?.name ?? "Competition",
    competitionColor: competition?.color ?? "#64748b",
    activityType: activity.activityType,
    status: activity.status,
    dateTimeLabel: formatDateTimeRange(activity.startsAt, activity.endsAt),
    participantCount: activity.participantCount,
  };
}

function buildEmptyCellsById(ids: string[], dateColumns: TimelineDateColumn[]) {
  return new Map(
    ids.map((id) => [
      id,
      Object.fromEntries(
        dateColumns.map((column) => [
          column.key,
          [] as TimelineCellActivity[],
        ]),
      ) as Record<string, TimelineCellActivity[]>,
    ]),
  );
}

function isUpcomingActivity(activity: TimelineActivity, renderedAt: string) {
  return Boolean(
    activity.startsAt &&
      new Date(activity.startsAt).getTime() >= new Date(renderedAt).getTime(),
  );
}

function formatDateTimeRange(startsAt: string | null, endsAt: string | null) {
  const startDate = formatDate(startsAt);
  const startTime = formatTime(startsAt);
  const endDate = formatDate(endsAt);
  const endTime = formatTime(endsAt);

  if (startDate && endDate && startDate !== endDate) {
    return `${startDate} ${startTime ?? ""} - ${endDate} ${endTime ?? ""}`.trim();
  }

  if (startTime && endTime) {
    return `${startDate ?? ""} ${startTime} - ${endTime}`.trim();
  }

  return [startDate, startTime].filter(Boolean).join(" ") || "Scheduled";
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(TIMELINE_LOCALE, {
    month: "short",
    day: "numeric",
    timeZone: TIMELINE_TIME_ZONE,
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(TIMELINE_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMELINE_TIME_ZONE,
  }).format(new Date(value));
}

function formatDateRangeLabel(columns: TimelineDateColumn[]) {
  if (columns.length === 0) {
    return "No scheduled dates";
  }

  const firstDate = parseDateKey(columns[0].key);
  const lastDate = parseDateKey(columns[columns.length - 1].key);
  const formatter = new Intl.DateTimeFormat(TIMELINE_LOCALE, {
    dateStyle: "medium",
    timeZone: TIMELINE_TIME_ZONE,
  });

  if (columns.length === 1) {
    return formatter.format(firstDate);
  }

  return `${formatter.format(firstDate)} - ${formatter.format(lastDate)}`;
}

function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = toDateKey(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const endDate = toDateKey(new Date(Date.UTC(year, monthNumber, 0)));

  return { startDate, endDate };
}

function getUniqueSortedValues(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right));
}

function setOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | null,
) {
  if (value) {
    params.set(key, value);
  }
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}
