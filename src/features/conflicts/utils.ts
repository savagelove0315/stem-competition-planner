import { z } from "zod";

import { formatPlainTimeRange } from "@/lib/plain-date-time";
import type {
  ConflictAssignment,
  ConflictCompetition,
  ConflictDetectionSeverity,
  ConflictFilters,
  ConflictReviewRecord,
  ConflictReviewStatus,
  ConflictStudent,
  ConflictViewModel,
  DetectedConflict,
} from "@/features/conflicts/types";

const DEFAULT_BUFFER_MINUTES = 90;

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

const severitySchema = z
  .enum(["serious", "mild", "warning"])
  .or(z.literal(""))
  .catch("");

const reviewStatusSchema = z
  .enum(["unreviewed", "reviewed", "resolved"])
  .or(z.literal(""))
  .catch("");

const conflictFilterSchema = z
  .object({
    month: monthValueSchema,
    startDate: dateValueSchema,
    endDate: dateValueSchema,
    competitionId: z.string().trim().catch(""),
    severity: severitySchema,
    reviewStatus: reviewStatusSchema,
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
      severity: value.severity || null,
      reviewStatus: value.reviewStatus || null,
      gradeLevel: value.gradeLevel || null,
      className: value.className || null,
      onlyMultiCompetition: value.onlyMultiCompetition,
    } satisfies ConflictFilters;
  });

type ActivityWindow = {
  startDate: string;
  endDate: string;
  startMinutes: number | null;
  endMinutes: number | null;
  hasCompleteSameDayTime: boolean;
  isMultiDay: boolean;
};

type PairEvaluation = {
  severity: ConflictDetectionSeverity;
  reason: string;
  suggestedAction: string;
  startDate: string;
  endDate: string;
} | null;

export function parseConflictFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ConflictFilters {
  return conflictFilterSchema.parse({
    month: getSearchParam(searchParams.month),
    startDate: getSearchParam(searchParams.startDate),
    endDate: getSearchParam(searchParams.endDate),
    competitionId: getSearchParam(searchParams.competitionId),
    severity: getSearchParam(searchParams.severity),
    reviewStatus: getSearchParam(searchParams.reviewStatus),
    gradeLevel: getSearchParam(searchParams.gradeLevel),
    className: getSearchParam(searchParams.className),
    onlyMultiCompetition: getSearchParam(searchParams.onlyMultiCompetition),
  });
}

export function buildConflictViewModel({
  students,
  assignments,
  competitions,
  reviewRecords,
  filters,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
}: {
  students: ConflictStudent[];
  assignments: ConflictAssignment[];
  competitions: ConflictCompetition[];
  reviewRecords: ConflictReviewRecord[];
  filters: ConflictFilters;
  bufferMinutes?: number;
}): ConflictViewModel {
  const hasParticipantData = assignments.length > 0;
  const activeStudents = students.filter((student) => student.status === "active");
  const studentsById = new Map(activeStudents.map((student) => [student.id, student]));
  const activeAssignments = assignments.filter((assignment) => {
    const activity = assignment.activity;

    return (
      assignment.status !== "cancelled" &&
      activity !== null &&
      activity.status !== "cancelled" &&
      activity.status !== "archived" &&
      getActivityWindow(assignment) !== null
    );
  });
  const assignmentsByStudent = new Map<string, ConflictAssignment[]>();
  const reviewRecordsByKey = new Map(
    reviewRecords.flatMap((record) => {
      const key = record.conflictKey ?? getReviewRecordFallbackKey(record);

      return key ? [[key, record] as const] : [];
    }),
  );

  activeAssignments.forEach((assignment) => {
    if (!studentsById.has(assignment.studentId)) {
      return;
    }

    const studentAssignments = assignmentsByStudent.get(assignment.studentId) ?? [];
    studentAssignments.push(assignment);
    assignmentsByStudent.set(assignment.studentId, studentAssignments);
  });

  const detectedConflicts: DetectedConflict[] = [];

  assignmentsByStudent.forEach((studentAssignments, studentId) => {
    const student = studentsById.get(studentId);

    if (!student) {
      return;
    }

    const sortedAssignments = [...studentAssignments].sort((left, right) =>
      getComparableStart(left).localeCompare(getComparableStart(right)),
    );

    for (let leftIndex = 0; leftIndex < sortedAssignments.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < sortedAssignments.length;
        rightIndex += 1
      ) {
        const firstAssignment = sortedAssignments[leftIndex];
        const secondAssignment = sortedAssignments[rightIndex];
        const evaluation = evaluateAssignmentPair(
          firstAssignment,
          secondAssignment,
          bufferMinutes,
        );

        if (!evaluation) {
          continue;
        }

        detectedConflicts.push(
          buildDetectedConflict({
            student,
            firstAssignment,
            secondAssignment,
            evaluation,
            reviewRecordsByKey,
          }),
        );
      }
    }
  });

  const filteredConflicts = detectedConflicts.filter((conflict) =>
    doesConflictMatchFilters(conflict, filters),
  );
  const unresolvedConflicts = filteredConflicts.filter(
    (conflict) => conflict.reviewStatus !== "resolved",
  );
  const seriousConflicts = filteredConflicts.filter(
    (conflict) => conflict.severity === "serious",
  );
  const highRiskDateSource =
    seriousConflicts.length > 0 ? seriousConflicts : filteredConflicts;
  const highRiskDates = new Set(
    highRiskDateSource.flatMap((conflict) =>
      getDateKeysInRange(conflict.conflictStartDate, conflict.conflictEndDate),
    ),
  );

  return {
    conflicts: filteredConflicts,
    summary: {
      totalDetectedConflicts: filteredConflicts.length,
      unreviewedConflicts: filteredConflicts.filter(
        (conflict) => conflict.reviewStatus === "unreviewed",
      ).length,
      reviewedConflicts: filteredConflicts.filter(
        (conflict) => conflict.reviewStatus === "reviewed",
      ).length,
      resolvedConflicts: filteredConflicts.filter(
        (conflict) => conflict.reviewStatus === "resolved",
      ).length,
      seriousUnresolvedConflicts: unresolvedConflicts.filter(
        (conflict) => conflict.severity === "serious",
      ).length,
      studentsAffected: new Set(
        filteredConflicts.map((conflict) => conflict.student.id),
      ).size,
      highRiskDates: highRiskDates.size,
    },
    filterOptions: {
      competitions,
      gradeLevels: getUniqueSortedValues(students.map((student) => student.gradeLevel)),
      classNames: getUniqueSortedValues(students.map((student) => student.className)),
    },
    hasParticipantData,
    bufferMinutes,
  };
}

function evaluateAssignmentPair(
  firstAssignment: ConflictAssignment,
  secondAssignment: ConflictAssignment,
  bufferMinutes: number,
): PairEvaluation {
  const firstWindow = getActivityWindow(firstAssignment);
  const secondWindow = getActivityWindow(secondAssignment);

  if (!firstWindow || !secondWindow) {
    return null;
  }

  const overlap = getDateRangeOverlap(firstWindow, secondWindow);

  if (!overlap) {
    return null;
  }

  if (
    firstWindow.hasCompleteSameDayTime &&
    secondWindow.hasCompleteSameDayTime &&
    overlap.startDate === overlap.endDate
  ) {
    const firstStart = firstWindow.startMinutes ?? 0;
    const firstEnd = firstWindow.endMinutes ?? firstStart;
    const secondStart = secondWindow.startMinutes ?? 0;
    const secondEnd = secondWindow.endMinutes ?? secondStart;

    if (firstStart < secondEnd && secondStart < firstEnd) {
      return {
        severity: "serious",
        reason: "The student is assigned to activities with overlapping times.",
        suggestedAction:
          "Move one activity or reassign the student before publishing the schedule.",
        ...overlap,
      };
    }

    const gapMinutes = Math.max(
      0,
      Math.max(firstStart, secondStart) - Math.min(firstEnd, secondEnd),
    );

    if (gapMinutes < bufferMinutes) {
      return {
        severity: "mild",
        reason: `The activities are on the same day with a ${gapMinutes}-minute gap, below the ${bufferMinutes}-minute buffer.`,
        suggestedAction:
          "Review the gap and add travel or preparation time if needed.",
        ...overlap,
      };
    }

    return null;
  }

  if (firstWindow.isMultiDay || secondWindow.isMultiDay) {
    return {
      severity: "warning",
      reason:
        "A multi-day activity overlaps another assigned activity date, and exact daily timing may need review.",
      suggestedAction:
        "Confirm the daily schedule before deciding whether the assignment is safe.",
      ...overlap,
    };
  }

  return {
    severity: "warning",
    reason:
      "The activities share a schedule date, but one or both activities have incomplete time data.",
    suggestedAction:
      "Confirm exact start and end times before deciding whether the assignment is safe.",
    ...overlap,
  };
}

function buildDetectedConflict({
  student,
  firstAssignment,
  secondAssignment,
  evaluation,
  reviewRecordsByKey,
}: {
  student: ConflictStudent;
  firstAssignment: ConflictAssignment;
  secondAssignment: ConflictAssignment;
  evaluation: NonNullable<PairEvaluation>;
  reviewRecordsByKey: Map<string, ConflictReviewRecord>;
}): DetectedConflict {
  const firstActivity = firstAssignment.activity;
  const secondActivity = secondAssignment.activity;
  const conflictKey = buildConflictKey({
    studentId: student.id,
    firstActivityId: firstAssignment.activityId,
    secondActivityId: secondAssignment.activityId,
    startDate: evaluation.startDate,
    endDate: evaluation.endDate,
  });
  const savedRecord = reviewRecordsByKey.get(conflictKey) ?? null;
  const reviewStatus = getReviewStatus(savedRecord);

  return {
    id: [
      student.id,
      firstAssignment.id,
      secondAssignment.id,
      evaluation.startDate,
      evaluation.endDate,
    ].join(":"),
    conflictKey,
    student,
    conflictDateLabel: formatDateRangeLabel(
      evaluation.startDate,
      evaluation.endDate,
    ),
    conflictStartDate: evaluation.startDate,
    conflictEndDate: evaluation.endDate,
    severity: evaluation.severity,
    reason: evaluation.reason,
    suggestedAction: evaluation.suggestedAction,
    activityOne: {
      assignmentId: firstAssignment.id,
      activityId: firstAssignment.activityId,
      activityName: firstActivity?.name ?? "Unknown activity",
      competitionId: firstAssignment.competitionId,
      competitionName: firstActivity?.competition?.name ?? "Competition",
      competitionLabel:
        firstActivity?.competition?.shortName ??
        firstActivity?.competition?.name ??
        "Competition",
      competitionColor: firstActivity?.competition?.color ?? "#64748b",
      timeLabel: formatTimeRange(
        firstActivity?.startsAt ?? null,
        firstActivity?.endsAt ?? null,
      ),
      startsAt: firstActivity?.startsAt ?? null,
      endsAt: firstActivity?.endsAt ?? null,
    },
    activityTwo: {
      assignmentId: secondAssignment.id,
      activityId: secondAssignment.activityId,
      activityName: secondActivity?.name ?? "Unknown activity",
      competitionId: secondAssignment.competitionId,
      competitionName: secondActivity?.competition?.name ?? "Competition",
      competitionLabel:
        secondActivity?.competition?.shortName ??
        secondActivity?.competition?.name ??
        "Competition",
      competitionColor: secondActivity?.competition?.color ?? "#64748b",
      timeLabel: formatTimeRange(
        secondActivity?.startsAt ?? null,
        secondActivity?.endsAt ?? null,
      ),
      startsAt: secondActivity?.startsAt ?? null,
      endsAt: secondActivity?.endsAt ?? null,
    },
    savedRecord,
    reviewStatus,
    teacherNote: savedRecord?.teacherNote ?? null,
    resolutionNote: savedRecord?.resolutionNote ?? null,
  };
}

function doesConflictMatchFilters(
  conflict: DetectedConflict,
  filters: ConflictFilters,
) {
  if (filters.gradeLevel && conflict.student.gradeLevel !== filters.gradeLevel) {
    return false;
  }

  if (filters.className && conflict.student.className !== filters.className) {
    return false;
  }

  if (filters.onlyMultiCompetition && !conflict.student.isMultiCompetition) {
    return false;
  }

  if (filters.severity && conflict.severity !== filters.severity) {
    return false;
  }

  if (filters.reviewStatus && conflict.reviewStatus !== filters.reviewStatus) {
    return false;
  }

  if (
    filters.competitionId &&
    conflict.activityOne.competitionId !== filters.competitionId &&
    conflict.activityTwo.competitionId !== filters.competitionId
  ) {
    return false;
  }

  if (!filters.startDate && !filters.endDate) {
    return true;
  }

  const rangeStart = filters.startDate ?? conflict.conflictStartDate;
  const rangeEnd = filters.endDate ?? conflict.conflictEndDate;

  return conflict.conflictStartDate <= rangeEnd && conflict.conflictEndDate >= rangeStart;
}

export function buildConflictKey({
  studentId,
  firstActivityId,
  secondActivityId,
  startDate,
  endDate,
}: {
  studentId: string;
  firstActivityId: string;
  secondActivityId: string;
  startDate: string;
  endDate: string;
}) {
  const [activityAId, activityBId] = [firstActivityId, secondActivityId].sort();

  return [
    "student_overlap",
    studentId,
    activityAId,
    activityBId,
    startDate,
    endDate,
  ].join(":");
}

function getReviewStatus(
  savedRecord: ConflictReviewRecord | null,
): ConflictReviewStatus {
  if (!savedRecord) {
    return "unreviewed";
  }

  if (savedRecord.status === "resolved") {
    return "resolved";
  }

  if (savedRecord.status === "acknowledged") {
    return "reviewed";
  }

  return "unreviewed";
}

function getReviewRecordFallbackKey(record: ConflictReviewRecord) {
  if (!record.studentId || !record.conflictStartDate || !record.conflictEndDate) {
    return null;
  }

  return buildConflictKey({
    studentId: record.studentId,
    firstActivityId: record.primaryActivityId,
    secondActivityId: record.conflictingActivityId,
    startDate: record.conflictStartDate,
    endDate: record.conflictEndDate,
  });
}

function getActivityWindow(assignment: ConflictAssignment): ActivityWindow | null {
  const startsAt = assignment.activity?.startsAt;
  const endsAt = assignment.activity?.endsAt ?? startsAt;

  if (!startsAt && !endsAt) {
    return null;
  }

  const firstValue = startsAt ?? endsAt;

  if (!firstValue) {
    return null;
  }

  const startDate = toDateKey(new Date(firstValue));
  const endDate = endsAt ? toDateKey(new Date(endsAt)) : startDate;
  const normalized =
    startDate <= endDate
      ? { startDate, endDate }
      : { startDate: endDate, endDate: startDate };
  const hasCompleteSameDayTime =
    Boolean(startsAt && assignment.activity?.endsAt) &&
    normalized.startDate === normalized.endDate;

  return {
    ...normalized,
    startMinutes: startsAt ? getMinutesSinceStartOfDay(new Date(startsAt)) : null,
    endMinutes: assignment.activity?.endsAt
      ? getMinutesSinceStartOfDay(new Date(assignment.activity.endsAt))
      : null,
    hasCompleteSameDayTime,
    isMultiDay: normalized.startDate !== normalized.endDate,
  };
}

function getDateRangeOverlap(
  firstWindow: ActivityWindow,
  secondWindow: ActivityWindow,
) {
  const startDate =
    firstWindow.startDate > secondWindow.startDate
      ? firstWindow.startDate
      : secondWindow.startDate;
  const endDate =
    firstWindow.endDate < secondWindow.endDate
      ? firstWindow.endDate
      : secondWindow.endDate;

  if (startDate > endDate) {
    return null;
  }

  return { startDate, endDate };
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

function getComparableStart(assignment: ConflictAssignment) {
  return assignment.activity?.startsAt ?? assignment.activity?.endsAt ?? "";
}

function getMinutesSinceStartOfDay(value: Date) {
  return value.getHours() * 60 + value.getMinutes();
}

function formatDateRangeLabel(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  if (startDate === endDate) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatTimeRange(startsAt: string | null, endsAt: string | null) {
  return formatPlainTimeRange(startsAt, endsAt);
}

function getDateKeysInRange(startDate: string, endDate: string) {
  const keys: string[] = [];
  let currentDate = parseDateKey(startDate);
  const finalDate = parseDateKey(endDate);

  while (currentDate <= finalDate) {
    keys.push(toDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return keys;
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
