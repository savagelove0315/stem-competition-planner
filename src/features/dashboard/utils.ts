import type {
  CompetitionOverview,
  DashboardActivity,
  DashboardActivityParticipant,
  DashboardData,
  DashboardStudent,
  DashboardViewModel,
  StudentWorkloadOverview,
  UpcomingActivityOverview,
} from "@/features/dashboard/types";
import type {
  ConflictDetectionSeverity,
  ConflictReviewStatus,
  DetectedConflict,
} from "@/features/conflicts/types";

const UPCOMING_ACTIVITY_LIMIT = 8;
const CONFLICT_ALERT_LIMIT = 6;
const STUDENT_WORKLOAD_LIMIT = 8;
const HIGH_UPCOMING_ACTIVITY_COUNT = 3;

const activeCompetitionStatuses = new Set(["active"]);
const overviewCompetitionStatuses = new Set(["active", "planned"]);
const inactiveActivityStatuses = new Set(["cancelled", "archived", "completed"]);

const severityRank: Record<ConflictDetectionSeverity, number> = {
  serious: 0,
  mild: 1,
  warning: 2,
};

const reviewStatusRank: Record<ConflictReviewStatus, number> = {
  unreviewed: 0,
  reviewed: 1,
  resolved: 2,
};

export function buildDashboardViewModel(
  data: DashboardData,
  now = new Date(),
): DashboardViewModel {
  const upcomingActivities = getUpcomingActivities(
    data.activities,
    data.activityParticipants,
    now,
  );
  const unresolvedConflicts = data.conflicts
    .filter((conflict) => conflict.reviewStatus !== "resolved")
    .sort(compareConflicts);
  const competitionOverviews = getCompetitionOverviews(
    data,
    upcomingActivities,
  );
  const studentWorkloads = getStudentWorkloads(
    data.students,
    data.activityParticipants,
    upcomingActivities,
  );

  return {
    summary: {
      activeCompetitions: data.competitions.filter((competition) =>
        activeCompetitionStatuses.has(competition.status),
      ).length,
      activeStudents: data.students.filter((student) => student.status === "active")
        .length,
      upcomingActivities: upcomingActivities.length,
      multiCompetitionStudents: data.students.filter(
        (student) =>
          student.status === "active" &&
          student.registeredCompetitionIds.length >= 2,
      ).length,
      unresolvedConflicts: unresolvedConflicts.length,
      seriousUnresolvedConflicts: unresolvedConflicts.filter(
        (conflict) => conflict.severity === "serious",
      ).length,
    },
    upcomingActivities: upcomingActivities.slice(0, UPCOMING_ACTIVITY_LIMIT),
    unresolvedConflicts: unresolvedConflicts.slice(0, CONFLICT_ALERT_LIMIT),
    competitionOverviews,
    studentWorkloads,
    hasCompetitions: data.competitions.length > 0,
    hasStudents: data.students.length > 0,
    hasActivities: data.activities.length > 0,
    hasConflicts: unresolvedConflicts.length > 0,
  };
}

function getUpcomingActivities(
  activities: DashboardActivity[],
  participants: DashboardActivityParticipant[],
  now: Date,
): UpcomingActivityOverview[] {
  const participantCounts = countBy(participants, (participant) => participant.activityId);

  return activities
    .filter((activity): activity is DashboardActivity & { startsAt: string } => {
      if (activity.startsAt === null) {
        return false;
      }

      return (
        new Date(activity.startsAt).getTime() >= now.getTime() &&
        !inactiveActivityStatuses.has(activity.status)
      );
    })
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .map((activity) => ({
      ...activity,
      participantCount: participantCounts.get(activity.id) ?? 0,
    }));
}

function getCompetitionOverviews(
  data: DashboardData,
  upcomingActivities: UpcomingActivityOverview[],
): CompetitionOverview[] {
  const enrolledStudentCounts = new Map<string, number>();
  const activityCounts = countBy(data.activities, (activity) => activity.competitionId);
  const upcomingActivityCounts = countBy(
    upcomingActivities,
    (activity) => activity.competitionId,
  );
  const participantAssignmentCounts = countBy(
    data.activityParticipants,
    (participant) => participant.competitionId,
  );

  data.students.forEach((student) => {
    student.registeredCompetitionIds.forEach((competitionId) => {
      enrolledStudentCounts.set(
        competitionId,
        (enrolledStudentCounts.get(competitionId) ?? 0) + 1,
      );
    });
  });

  return data.competitions
    .filter((competition) => overviewCompetitionStatuses.has(competition.status))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((competition) => ({
      ...competition,
      enrolledStudentCount: enrolledStudentCounts.get(competition.id) ?? 0,
      activityCount: activityCounts.get(competition.id) ?? 0,
      upcomingActivityCount: upcomingActivityCounts.get(competition.id) ?? 0,
      participantAssignmentCount:
        participantAssignmentCounts.get(competition.id) ?? 0,
    }));
}

function getStudentWorkloads(
  students: DashboardStudent[],
  participants: DashboardActivityParticipant[],
  upcomingActivities: UpcomingActivityOverview[],
): StudentWorkloadOverview[] {
  const upcomingActivityIds = new Set(
    upcomingActivities.map((activity) => activity.id),
  );
  const upcomingCountsByStudent = countBy(
    participants.filter((participant) =>
      upcomingActivityIds.has(participant.activityId),
    ),
    (participant) => participant.studentId,
  );

  return students
    .map((student) => ({
      ...student,
      competitionCount: student.registeredCompetitionIds.length,
      upcomingActivityCount: upcomingCountsByStudent.get(student.id) ?? 0,
    }))
    .filter(
      (student) =>
        student.status === "active" &&
        (student.competitionCount >= 2 ||
          student.upcomingActivityCount >= HIGH_UPCOMING_ACTIVITY_COUNT),
    )
    .sort((left, right) => {
      const activityDelta = right.upcomingActivityCount - left.upcomingActivityCount;

      if (activityDelta !== 0) {
        return activityDelta;
      }

      const competitionDelta = right.competitionCount - left.competitionCount;

      if (competitionDelta !== 0) {
        return competitionDelta;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, STUDENT_WORKLOAD_LIMIT);
}

function compareConflicts(left: DetectedConflict, right: DetectedConflict) {
  const severityDelta = severityRank[left.severity] - severityRank[right.severity];

  if (severityDelta !== 0) {
    return severityDelta;
  }

  const reviewDelta =
    reviewStatusRank[left.reviewStatus] - reviewStatusRank[right.reviewStatus];

  if (reviewDelta !== 0) {
    return reviewDelta;
  }

  return left.conflictStartDate.localeCompare(right.conflictStartDate);
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
}
