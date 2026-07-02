import { z } from "zod";

import { buildConflictViewModel } from "@/features/conflicts/utils";
import { formatPlainTime } from "@/lib/plain-date-time";
import type { getReportsData } from "@/features/reports/queries";
import type {
  ActivityScheduleReportRow,
  ClassGradeParticipationReportRow,
  CompetitionParticipationReportRow,
  ConflictStatusReport,
  ReportFilters,
  ReportsViewModel,
  ReportType,
  StudentWorkloadReportRow,
  WorkloadLevel,
} from "@/features/reports/types";
import type { ActivityStatus } from "@/types/database";

type ReportsData = Awaited<ReturnType<typeof getReportsData>>;

const activityStatusValues = [
  "draft",
  "planned",
  "active",
  "completed",
  "cancelled",
  "archived",
] as const;

const reportTypeSchema = z
  .enum([
    "competition",
    "student-workload",
    "activity-schedule",
    "conflicts",
    "class-grade",
  ])
  .catch("competition");

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

const activityStatusSchema = z
  .enum(activityStatusValues)
  .or(z.literal(""))
  .catch("");

const reportFilterSchema = z
  .object({
    report: reportTypeSchema,
    month: monthValueSchema,
    startDate: dateValueSchema,
    endDate: dateValueSchema,
    competitionId: z.string().trim().catch(""),
    gradeLevel: z.string().trim().catch(""),
    className: z.string().trim().catch(""),
    activityStatus: activityStatusSchema,
  })
  .transform((value) => {
    const month = value.month || null;
    const monthRange = month ? getMonthRange(month) : null;

    return {
      report: value.report,
      month,
      startDate: value.startDate || monthRange?.startDate || null,
      endDate: value.endDate || monthRange?.endDate || null,
      competitionId: value.competitionId || null,
      gradeLevel: value.gradeLevel || null,
      className: value.className || null,
      activityStatus: (value.activityStatus || null) as ActivityStatus | null,
    } satisfies ReportFilters;
  });

export function parseReportFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ReportFilters {
  return reportFilterSchema.parse({
    report: getSearchParam(searchParams.report),
    month: getSearchParam(searchParams.month),
    startDate: getSearchParam(searchParams.startDate),
    endDate: getSearchParam(searchParams.endDate),
    competitionId: getSearchParam(searchParams.competitionId),
    gradeLevel: getSearchParam(searchParams.gradeLevel),
    className: getSearchParam(searchParams.className),
    activityStatus: getSearchParam(searchParams.activityStatus),
  });
}

export function buildReportsViewModel(
  reportsData: ReportsData,
  filters: ReportFilters,
): ReportsViewModel {
  const now = new Date();
  const activeStudents = reportsData.students.filter(
    (student) => student.status === "active",
  );
  const filteredStudents = activeStudents.filter(
    (student) =>
      (!filters.gradeLevel || student.gradeLevel === filters.gradeLevel) &&
      (!filters.className || student.className === filters.className) &&
      (!filters.competitionId ||
        student.competitionAssignments.some(
          (assignment) => assignment.competitionId === filters.competitionId,
        )),
  );
  const filteredStudentIds = new Set(filteredStudents.map((student) => student.id));
  const competitions = reportsData.competitions.filter(
    (competition) =>
      !filters.competitionId || competition.id === filters.competitionId,
  );
  const activities = reportsData.activities.filter((activity) => {
    if (filters.competitionId && activity.competitionId !== filters.competitionId) {
      return false;
    }

    if (filters.activityStatus && activity.status !== filters.activityStatus) {
      return false;
    }

    return doesActivityMatchDateFilters(activity.startsAt, activity.endsAt, filters);
  });
  const activityIds = new Set(activities.map((activity) => activity.id));
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const activityParticipants = reportsData.activityParticipants.filter(
    (participant) =>
      activityIds.has(participant.activityId) &&
      filteredStudentIds.has(participant.studentId),
  );
  const participantsByActivityId = groupBy(
    activityParticipants,
    (participant) => participant.activityId,
  );
  const conflictViewModel = buildConflictViewModel({
    ...reportsData.conflictData,
    filters: {
      month: filters.month,
      startDate: filters.startDate,
      endDate: filters.endDate,
      competitionId: filters.competitionId,
      severity: null,
      reviewStatus: null,
      gradeLevel: filters.gradeLevel,
      className: filters.className,
      onlyMultiCompetition: false,
    },
  });
  const unresolvedConflicts = conflictViewModel.conflicts.filter(
    (conflict) => conflict.reviewStatus !== "resolved",
  );
  const unresolvedConflictsByStudentId = groupBy(
    unresolvedConflicts,
    (conflict) => conflict.student.id,
  );
  const seriousUnresolvedStudentIds = new Set(
    unresolvedConflicts
      .filter((conflict) => conflict.severity === "serious")
      .map((conflict) => conflict.student.id),
  );

  const competitionRows = buildCompetitionRows({
    competitions,
    filteredStudents,
    activities,
    activityParticipants,
    now,
  });
  const studentWorkloadRows = buildStudentWorkloadRows({
    students: filteredStudents,
    activityParticipants,
    activityById,
    unresolvedConflictsByStudentId,
    seriousUnresolvedStudentIds,
    now,
  });
  const activityScheduleRows = buildActivityScheduleRows({
    activities,
    participantsByActivityId,
    now,
  });
  const conflictStatus = buildConflictStatusReport(conflictViewModel.conflicts);
  const classGradeRows = buildClassGradeRows({
    students: filteredStudents,
    activityParticipants,
    unresolvedConflictsByStudentId,
  });

  return {
    filters,
    filterOptions: {
      competitions: reportsData.competitions
        .map((competition) => ({
          id: competition.id,
          name: competition.name,
          shortName: competition.shortName,
          color: competition.color,
          status: competition.status,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
      gradeLevels: getUniqueSortedValues(
        activeStudents.map((student) => student.gradeLevel),
      ),
      classNames: getUniqueSortedValues(
        activeStudents.map((student) => student.className),
      ),
    },
    summaryCards: getSummaryCards(filters.report, {
      competitionRows,
      studentWorkloadRows,
      activityScheduleRows,
      conflictStatus,
      classGradeRows,
    }),
    competitionRows,
    studentWorkloadRows,
    activityScheduleRows,
    conflictStatus,
    classGradeRows,
  };
}

function buildCompetitionRows({
  competitions,
  filteredStudents,
  activities,
  activityParticipants,
  now,
}: {
  competitions: ReportsData["competitions"];
  filteredStudents: ReportsData["students"];
  activities: ReportsData["activities"];
  activityParticipants: ReportsData["activityParticipants"];
  now: Date;
}): CompetitionParticipationReportRow[] {
  return competitions
    .map((competition) => {
      const enrolledStudents = filteredStudents.filter((student) =>
        student.competitionAssignments.some(
          (assignment) => assignment.competitionId === competition.id,
        ),
      );
      const competitionActivities = activities.filter(
        (activity) => activity.competitionId === competition.id,
      );

      return {
        competitionId: competition.id,
        competitionName: competition.name,
        competitionLabel: competition.shortName ?? competition.name,
        competitionColor: competition.color,
        status: competition.status,
        enrolledStudentCount: enrolledStudents.length,
        activityCount: competitionActivities.length,
        participantAssignmentCount: activityParticipants.filter(
          (participant) => participant.competitionId === competition.id,
        ).length,
        multiCompetitionStudentCount: enrolledStudents.filter(
          (student) => student.competitionAssignments.length >= 2,
        ).length,
        upcomingActivityCount: competitionActivities.filter(
          (activity) => activity.startsAt && new Date(activity.startsAt) > now,
        ).length,
      };
    })
    .sort((left, right) =>
      left.competitionName.localeCompare(right.competitionName),
    );
}

function buildStudentWorkloadRows({
  students,
  activityParticipants,
  activityById,
  unresolvedConflictsByStudentId,
  seriousUnresolvedStudentIds,
  now,
}: {
  students: ReportsData["students"];
  activityParticipants: ReportsData["activityParticipants"];
  activityById: Map<string, ReportsData["activities"][number]>;
  unresolvedConflictsByStudentId: Map<string, unknown[]>;
  seriousUnresolvedStudentIds: Set<string>;
  now: Date;
}): StudentWorkloadReportRow[] {
  return students
    .filter((student) => student.competitionAssignments.length > 0)
    .map((student) => {
      const studentAssignments = activityParticipants.filter(
        (participant) => participant.studentId === student.id,
      );
      const upcomingActivitiesCount = studentAssignments.filter((participant) => {
        const activity = activityById.get(participant.activityId);

        return Boolean(activity?.startsAt && new Date(activity.startsAt) > now);
      }).length;
      const hasUnresolvedSeriousConflict = seriousUnresolvedStudentIds.has(student.id);
      const workloadLevel = getWorkloadLevel({
        competitionCount: student.competitionAssignments.length,
        upcomingActivitiesCount,
        hasUnresolvedSeriousConflict,
      });

      return {
        studentId: student.id,
        studentName: getStudentName(student),
        studentCode: student.studentCode,
        className: student.className,
        gradeLevel: student.gradeLevel,
        competitionCount: student.competitionAssignments.length,
        activitiesAssignedCount: studentAssignments.length,
        upcomingActivitiesCount,
        unresolvedConflictsCount:
          unresolvedConflictsByStudentId.get(student.id)?.length ?? 0,
        hasUnresolvedSeriousConflict,
        workloadLevel,
      };
    })
    .sort((left, right) => left.studentName.localeCompare(right.studentName));
}

function buildActivityScheduleRows({
  activities,
  participantsByActivityId,
  now,
}: {
  activities: ReportsData["activities"];
  participantsByActivityId: Map<string, unknown[]>;
  now: Date;
}): ActivityScheduleReportRow[] {
  return activities.map((activity) => ({
    activityId: activity.id,
    activityName: activity.name,
    competitionName: activity.competition?.name ?? "Competition",
    competitionLabel:
      activity.competition?.shortName ?? activity.competition?.name ?? "Competition",
    competitionColor: activity.competition?.color ?? "#64748b",
    activityType: activity.activityType,
    status: activity.status,
    startsAt: activity.startsAt,
    endsAt: activity.endsAt,
    dateTimeLabel: formatDateTimeRange(activity.startsAt, activity.endsAt),
    participantCount: participantsByActivityId.get(activity.id)?.length ?? 0,
    timingStatus: getActivityTimingStatus(activity.startsAt, now),
  }));
}

function buildConflictStatusReport(
  conflicts: ReturnType<typeof buildConflictViewModel>["conflicts"],
): ConflictStatusReport {
  return {
    totalDetectedConflicts: conflicts.length,
    seriousConflicts: conflicts.filter((conflict) => conflict.severity === "serious")
      .length,
    mildConflicts: conflicts.filter((conflict) => conflict.severity === "mild")
      .length,
    warningConflicts: conflicts.filter((conflict) => conflict.severity === "warning")
      .length,
    unreviewedConflicts: conflicts.filter(
      (conflict) => conflict.reviewStatus === "unreviewed",
    ).length,
    reviewedConflicts: conflicts.filter(
      (conflict) => conflict.reviewStatus === "reviewed",
    ).length,
    resolvedConflicts: conflicts.filter(
      (conflict) => conflict.reviewStatus === "resolved",
    ).length,
    affectedStudents: new Set(conflicts.map((conflict) => conflict.student.id)).size,
    seriousUnresolvedConflicts: conflicts.filter(
      (conflict) =>
        conflict.severity === "serious" && conflict.reviewStatus !== "resolved",
    ).length,
    conflicts: conflicts.map((conflict) => ({
      id: conflict.id,
      studentName: conflict.student.name,
      className: conflict.student.className,
      gradeLevel: conflict.student.gradeLevel,
      conflictDateLabel: conflict.conflictDateLabel,
      activityOneName: conflict.activityOne.activityName,
      activityTwoName: conflict.activityTwo.activityName,
      severity: conflict.severity,
      reviewStatus: conflict.reviewStatus,
    })),
  };
}

function buildClassGradeRows({
  students,
  activityParticipants,
  unresolvedConflictsByStudentId,
}: {
  students: ReportsData["students"];
  activityParticipants: ReportsData["activityParticipants"];
  unresolvedConflictsByStudentId: Map<string, unknown[]>;
}): ClassGradeParticipationReportRow[] {
  const rowsByKey = new Map<string, ClassGradeParticipationReportRow>();

  students.forEach((student) => {
    const className = student.className;
    const gradeLevel = student.gradeLevel;
    const key = `${className ?? "Unassigned"}:${gradeLevel ?? "Unassigned"}`;
    const existing =
      rowsByKey.get(key) ??
      ({
        id: key,
        className,
        gradeLevel,
        studentsInvolved: 0,
        competitionRegistrations: 0,
        activityAssignments: 0,
        unresolvedConflicts: 0,
      } satisfies ClassGradeParticipationReportRow);

    existing.studentsInvolved += student.competitionAssignments.length > 0 ? 1 : 0;
    existing.competitionRegistrations += student.competitionAssignments.length;
    existing.activityAssignments += activityParticipants.filter(
      (participant) => participant.studentId === student.id,
    ).length;
    existing.unresolvedConflicts +=
      unresolvedConflictsByStudentId.get(student.id)?.length ?? 0;
    rowsByKey.set(key, existing);
  });

  return [...rowsByKey.values()]
    .filter(
      (row) =>
        row.studentsInvolved > 0 ||
        row.competitionRegistrations > 0 ||
        row.activityAssignments > 0 ||
        row.unresolvedConflicts > 0,
    )
    .sort(
      (left, right) =>
        (left.gradeLevel ?? "").localeCompare(right.gradeLevel ?? "") ||
        (left.className ?? "").localeCompare(right.className ?? ""),
    );
}

function getSummaryCards(
  reportType: ReportType,
  reports: {
    competitionRows: CompetitionParticipationReportRow[];
    studentWorkloadRows: StudentWorkloadReportRow[];
    activityScheduleRows: ActivityScheduleReportRow[];
    conflictStatus: ConflictStatusReport;
    classGradeRows: ClassGradeParticipationReportRow[];
  },
) {
  if (reportType === "student-workload") {
    return [
      { label: "Students", value: reports.studentWorkloadRows.length },
      {
        label: "High risk",
        value: reports.studentWorkloadRows.filter(
          (student) => student.workloadLevel === "high risk",
        ).length,
      },
      {
        label: "Busy",
        value: reports.studentWorkloadRows.filter(
          (student) => student.workloadLevel === "busy",
        ).length,
      },
      {
        label: "Upcoming activities",
        value: reports.studentWorkloadRows.reduce(
          (sum, student) => sum + student.upcomingActivitiesCount,
          0,
        ),
      },
    ];
  }

  if (reportType === "activity-schedule") {
    return [
      { label: "Activities", value: reports.activityScheduleRows.length },
      {
        label: "Upcoming",
        value: reports.activityScheduleRows.filter(
          (activity) => activity.timingStatus === "upcoming",
        ).length,
      },
      {
        label: "Past",
        value: reports.activityScheduleRows.filter(
          (activity) => activity.timingStatus === "past",
        ).length,
      },
      {
        label: "Unscheduled",
        value: reports.activityScheduleRows.filter(
          (activity) => activity.timingStatus === "unscheduled",
        ).length,
      },
    ];
  }

  if (reportType === "conflicts") {
    return [
      { label: "Detected conflicts", value: reports.conflictStatus.totalDetectedConflicts },
      { label: "Serious", value: reports.conflictStatus.seriousConflicts },
      { label: "Unreviewed", value: reports.conflictStatus.unreviewedConflicts },
      {
        label: "Serious unresolved",
        value: reports.conflictStatus.seriousUnresolvedConflicts,
      },
    ];
  }

  if (reportType === "class-grade") {
    return [
      { label: "Class / grade groups", value: reports.classGradeRows.length },
      {
        label: "Students involved",
        value: reports.classGradeRows.reduce(
          (sum, row) => sum + row.studentsInvolved,
          0,
        ),
      },
      {
        label: "Registrations",
        value: reports.classGradeRows.reduce(
          (sum, row) => sum + row.competitionRegistrations,
          0,
        ),
      },
      {
        label: "Unresolved conflicts",
        value: reports.classGradeRows.reduce(
          (sum, row) => sum + row.unresolvedConflicts,
          0,
        ),
      },
    ];
  }

  return [
    { label: "Competitions", value: reports.competitionRows.length },
    {
      label: "Enrolled students",
      value: reports.competitionRows.reduce(
        (sum, row) => sum + row.enrolledStudentCount,
        0,
      ),
    },
    {
      label: "Activities",
      value: reports.competitionRows.reduce((sum, row) => sum + row.activityCount, 0),
    },
    {
      label: "Assignments",
      value: reports.competitionRows.reduce(
        (sum, row) => sum + row.participantAssignmentCount,
        0,
      ),
    },
  ];
}

function getWorkloadLevel({
  competitionCount,
  upcomingActivitiesCount,
  hasUnresolvedSeriousConflict,
}: {
  competitionCount: number;
  upcomingActivitiesCount: number;
  hasUnresolvedSeriousConflict: boolean;
}): WorkloadLevel {
  if (hasUnresolvedSeriousConflict || upcomingActivitiesCount >= 3) {
    return "high risk";
  }

  if (competitionCount >= 2 || upcomingActivitiesCount >= 2) {
    return "busy";
  }

  return "normal";
}

function doesActivityMatchDateFilters(
  startsAt: string | null,
  endsAt: string | null,
  filters: ReportFilters,
) {
  if (!filters.startDate && !filters.endDate) {
    return true;
  }

  if (!startsAt && !endsAt) {
    return false;
  }

  const activityStart = startsAt ? toDateKey(new Date(startsAt)) : toDateKey(new Date(endsAt as string));
  const activityEnd = endsAt ? toDateKey(new Date(endsAt)) : activityStart;
  const rangeStart = filters.startDate ?? activityStart;
  const rangeEnd = filters.endDate ?? activityEnd;

  return activityStart <= rangeEnd && activityEnd >= rangeStart;
}

function getActivityTimingStatus(startsAt: string | null, now: Date) {
  if (!startsAt) {
    return "unscheduled" as const;
  }

  return new Date(startsAt) > now ? ("upcoming" as const) : ("past" as const);
}

export function formatDateTimeRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) {
    return "Unscheduled";
  }

  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  });
  const startLabel = startsAt
    ? [formatter.format(new Date(startsAt)), formatPlainTime(startsAt)]
        .filter(Boolean)
        .join(", ")
    : null;
  const endLabel = endsAt
    ? [formatter.format(new Date(endsAt)), formatPlainTime(endsAt)]
        .filter(Boolean)
        .join(", ")
    : null;

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel ?? endLabel ?? "Unscheduled";
}

function getStudentName(student: ReportsData["students"][number]) {
  return (
    student.displayName ??
    [student.firstName, student.lastName].filter(Boolean).join(" ")
  );
}

function groupBy<T>(
  values: T[],
  getKey: (value: T) => string,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  values.forEach((value) => {
    const key = getKey(value);
    const group = grouped.get(key) ?? [];
    group.push(value);
    grouped.set(key, group);
  });

  return grouped;
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

function getUniqueSortedValues(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right));
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
