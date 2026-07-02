import { z } from "zod";

import { formatPlainTimeRange } from "@/lib/plain-date-time";
import type {
  StudentTimelineAssignment,
  StudentTimelineCellActivity,
  StudentTimelineCompetition,
  StudentTimelineDateColumn,
  StudentTimelineFilters,
  StudentTimelineStudent,
  StudentTimelineViewModel,
} from "@/features/student-timeline/types";

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
    month: monthValueSchema,
    startDate: dateValueSchema,
    endDate: dateValueSchema,
    competitionId: z.string().trim().catch(""),
    gradeLevel: z.string().trim().catch(""),
    className: z.string().trim().catch(""),
    onlyMultiCompetition: z
      .string()
      .trim()
      .transform((value) => ["1", "on", "true"].includes(value))
      .catch(false),
  })
  .transform((value) => {
    const month = value.month || null;
    const monthRange = month ? getMonthRange(month) : null;
    const startDate = value.startDate || monthRange?.startDate || null;
    const endDate = value.endDate || monthRange?.endDate || null;

    return {
      month,
      startDate,
      endDate,
      competitionId: value.competitionId || null,
      gradeLevel: value.gradeLevel || null,
      className: value.className || null,
      onlyMultiCompetition: value.onlyMultiCompetition,
    } satisfies StudentTimelineFilters;
  });

export function parseStudentTimelineFilters(
  searchParams: Record<string, string | string[] | undefined>,
): StudentTimelineFilters {
  return timelineFilterSchema.parse({
    month: getSearchParam(searchParams.month),
    startDate: getSearchParam(searchParams.startDate),
    endDate: getSearchParam(searchParams.endDate),
    competitionId: getSearchParam(searchParams.competitionId),
    gradeLevel: getSearchParam(searchParams.gradeLevel),
    className: getSearchParam(searchParams.className),
    onlyMultiCompetition: getSearchParam(searchParams.onlyMultiCompetition),
  });
}

export function buildStudentTimelineViewModel({
  students,
  assignments,
  competitions,
  filters,
}: {
  students: StudentTimelineStudent[];
  assignments: StudentTimelineAssignment[];
  competitions: StudentTimelineCompetition[];
  filters: StudentTimelineFilters;
}): StudentTimelineViewModel {
  const hasParticipantData = assignments.length > 0;
  const filteredStudents = students.filter((student) => {
    if (filters.gradeLevel && student.gradeLevel !== filters.gradeLevel) {
      return false;
    }

    if (filters.className && student.className !== filters.className) {
      return false;
    }

    if (filters.onlyMultiCompetition && !student.isMultiCompetition) {
      return false;
    }

    if (
      filters.competitionId &&
      !student.registeredCompetitionIds.includes(filters.competitionId)
    ) {
      return false;
    }

    return true;
  });
  const filteredStudentIds = new Set(filteredStudents.map((student) => student.id));
  const filteredAssignments = assignments.filter((assignment) => {
    if (!filteredStudentIds.has(assignment.studentId)) {
      return false;
    }

    if (filters.competitionId && assignment.competitionId !== filters.competitionId) {
      return false;
    }

    return doesAssignmentTouchDateRange(assignment, filters);
  });
  const dateColumns = buildDateColumns(filteredAssignments, filters);
  const dateKeys = new Set(dateColumns.map((column) => column.key));
  const cellActivitiesByStudent = new Map<
    string,
    Record<string, StudentTimelineCellActivity[]>
  >();
  const visibleActivityIds = new Set<string>();

  filteredAssignments.forEach((assignment) => {
    const activity = assignment.activity;

    if (!activity) {
      return;
    }

    const activityDateKeys = getAssignmentDateKeys(assignment).filter((dateKey) =>
      dateKeys.has(dateKey),
    );

    if (activityDateKeys.length === 0) {
      return;
    }

    visibleActivityIds.add(activity.id);
    const studentCells =
      cellActivitiesByStudent.get(assignment.studentId) ??
      Object.fromEntries(dateColumns.map((column) => [column.key, []]));
    const cellActivity = mapCellActivity(assignment);

    activityDateKeys.forEach((dateKey) => {
      studentCells[dateKey] = [...(studentCells[dateKey] ?? []), cellActivity];
    });
    cellActivitiesByStudent.set(assignment.studentId, studentCells);
  });

  const rows = filteredStudents.map((student) => {
    const cells =
      cellActivitiesByStudent.get(student.id) ??
      Object.fromEntries(dateColumns.map((column) => [column.key, []]));
    const activityCount = Object.values(cells).reduce(
      (count, cellActivities) => count + cellActivities.length,
      0,
    );

    return {
      student,
      cells,
      activityCount,
    };
  });

  return {
    rows,
    dateColumns,
    summary: {
      studentsShown: rows.length,
      activitiesShown: visibleActivityIds.size,
      dateRangeLabel: formatDateRangeLabel(dateColumns),
      multiCompetitionStudents: rows.filter((row) => row.student.isMultiCompetition)
        .length,
    },
    filterOptions: {
      competitions,
      gradeLevels: getUniqueSortedValues(students.map((student) => student.gradeLevel)),
      classNames: getUniqueSortedValues(students.map((student) => student.className)),
    },
    hasParticipantData,
  };
}

function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDate = toDateKey(new Date(year, monthNumber - 1, 1));
  const endDate = toDateKey(new Date(year, monthNumber, 0));

  return { startDate, endDate };
}

function buildDateColumns(
  assignments: StudentTimelineAssignment[],
  filters: StudentTimelineFilters,
): StudentTimelineDateColumn[] {
  const range = getTimelineDateRange(assignments, filters);

  if (!range) {
    return [];
  }

  const columns: StudentTimelineDateColumn[] = [];
  let currentDate = parseDateKey(range.startDate);
  const finalDate = parseDateKey(range.endDate);

  while (currentDate <= finalDate) {
    const key = toDateKey(currentDate);
    columns.push({
      key,
      dayNumber: new Intl.DateTimeFormat("en", { day: "numeric" }).format(
        currentDate,
      ),
      weekday: new Intl.DateTimeFormat("en", { weekday: "short" }).format(
        currentDate,
      ),
      dateLabel: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(currentDate),
    });
    currentDate = addDays(currentDate, 1);
  }

  return columns;
}

function getTimelineDateRange(
  assignments: StudentTimelineAssignment[],
  filters: StudentTimelineFilters,
) {
  const assignmentDateKeys = assignments.flatMap(getAssignmentDateKeys);
  const startDate = filters.startDate ?? assignmentDateKeys.sort()[0] ?? null;
  const endDate =
    filters.endDate ?? assignmentDateKeys.sort()[assignmentDateKeys.length - 1] ?? null;

  if (!startDate || !endDate) {
    return null;
  }

  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate };
}

function doesAssignmentTouchDateRange(
  assignment: StudentTimelineAssignment,
  filters: StudentTimelineFilters,
) {
  if (!filters.startDate && !filters.endDate) {
    return true;
  }

  const dateKeys = getAssignmentDateKeys(assignment);

  if (dateKeys.length === 0) {
    return false;
  }

  const activityStart = dateKeys[0];
  const activityEnd = dateKeys[dateKeys.length - 1];
  const rangeStart = filters.startDate ?? activityStart;
  const rangeEnd = filters.endDate ?? activityEnd;

  return activityStart <= rangeEnd && activityEnd >= rangeStart;
}

function getAssignmentDateKeys(assignment: StudentTimelineAssignment) {
  const startsAt = assignment.activity?.startsAt;
  const endsAt = assignment.activity?.endsAt ?? startsAt;

  if (!startsAt && !endsAt) {
    return [];
  }

  const firstDateValue = startsAt ?? endsAt;

  if (!firstDateValue) {
    return [];
  }

  const startDateKey = toDateKey(new Date(firstDateValue));
  const endDateKey = endsAt ? toDateKey(new Date(endsAt)) : startDateKey;
  const keys: string[] = [];
  let currentDate = parseDateKey(startDateKey);
  const finalDate = parseDateKey(endDateKey);

  while (currentDate <= finalDate) {
    keys.push(toDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return keys;
}

function mapCellActivity(
  assignment: StudentTimelineAssignment,
): StudentTimelineCellActivity {
  const activity = assignment.activity;
  const competition = activity?.competition;

  return {
    assignmentId: assignment.id,
    activityId: assignment.activityId,
    name: activity?.name ?? "Unknown activity",
    competitionLabel: competition?.shortName ?? competition?.name ?? "Competition",
    competitionColor: competition?.color ?? "#64748b",
    activityType: activity?.activityType ?? null,
    timeLabel: formatTimeRange(activity?.startsAt ?? null, activity?.endsAt ?? null),
  };
}

function formatTimeRange(startsAt: string | null, endsAt: string | null) {
  return formatPlainTimeRange(startsAt, endsAt, "");
}

function formatDateRangeLabel(columns: StudentTimelineDateColumn[]) {
  if (columns.length === 0) {
    return "No scheduled dates";
  }

  const firstDate = parseDateKey(columns[0].key);
  const lastDate = parseDateKey(columns[columns.length - 1].key);
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

  if (columns.length === 1) {
    return formatter.format(firstDate);
  }

  return `${formatter.format(firstDate)} - ${formatter.format(lastDate)}`;
}

function getUniqueSortedValues(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right));
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}
