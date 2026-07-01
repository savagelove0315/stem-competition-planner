import type {
  CompetitionNoticeSettings,
  TrainingNoticeSettings,
} from "@/features/notice-settings/types";
import type {
  NoticeCompetition,
  NoticeCompetitionAssignment,
  NoticeStudentFilters,
  NoticeStudent,
  TrainingNoticeActivity,
  TrainingNoticeActivityFilters,
  TrainingNoticeStudent,
} from "./types";

const EMPTY_NOTICE_VALUE = "To be announced";

export function getNoticeStudentName(
  student: Pick<NoticeStudent, "name" | "studentCode">,
) {
  return student.name || student.studentCode || "Selected student";
}

export function formatNoticePeriod(competition: NoticeCompetition) {
  if (competition.noticePeriod) {
    return competition.noticePeriod;
  }

  if (!competition.startsAt && !competition.endsAt) {
    return EMPTY_NOTICE_VALUE;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kuching",
  });

  if (competition.startsAt && competition.endsAt) {
    const start = formatter.format(new Date(competition.startsAt));
    const end = formatter.format(new Date(competition.endsAt));
    return start === end ? start : `${start} - ${end}`;
  }

  const value = competition.startsAt ?? competition.endsAt;
  return value ? formatter.format(new Date(value)) : EMPTY_NOTICE_VALUE;
}

export function formatNoticeField(value: string | null) {
  return value?.trim() || EMPTY_NOTICE_VALUE;
}

export function formatTrainingNoticeDate(value: string | null) {
  if (!value) {
    return EMPTY_NOTICE_VALUE;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}

export function formatTrainingNoticeTime(activity: TrainingNoticeActivity) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuching",
  });
  const startTime = activity.startsAt
    ? formatter.format(new Date(activity.startsAt))
    : null;
  const endTime = activity.endsAt
    ? formatter.format(new Date(activity.endsAt))
    : null;

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime ?? EMPTY_NOTICE_VALUE;
}

export function filterNoticeStudents(
  students: NoticeStudent[],
  filters: NoticeStudentFilters,
) {
  return students.filter((student) => {
    if (filters.className && student.className !== filters.className) {
      return false;
    }

    if (filters.gradeLevel && student.gradeLevel !== filters.gradeLevel) {
      return false;
    }

    if (
      filters.competitionId &&
      !student.competitionAssignments.some(
        (assignment) => assignment.competition.id === filters.competitionId,
      )
    ) {
      return false;
    }

    if (filters.onlyWithCompetitions && student.competitionAssignments.length === 0) {
      return false;
    }

    if (
      filters.onlyMultiCompetition &&
      student.competitionAssignments.length < 2
    ) {
      return false;
    }

    return true;
  });
}

export function sortTrainingNoticeActivities(
  activities: TrainingNoticeActivity[],
  now = new Date(),
) {
  const nowTime = now.getTime();

  return [...activities].sort((firstActivity, secondActivity) => {
    const firstTime = firstActivity.startsAt
      ? new Date(firstActivity.startsAt).getTime()
      : Number.POSITIVE_INFINITY;
    const secondTime = secondActivity.startsAt
      ? new Date(secondActivity.startsAt).getTime()
      : Number.POSITIVE_INFINITY;
    const firstUpcoming = firstTime >= nowTime;
    const secondUpcoming = secondTime >= nowTime;

    if (firstUpcoming !== secondUpcoming) {
      return firstUpcoming ? -1 : 1;
    }

    if (firstTime !== secondTime) {
      return firstUpcoming ? firstTime - secondTime : secondTime - firstTime;
    }

    return firstActivity.name.localeCompare(secondActivity.name);
  });
}

export function filterTrainingNoticeActivities(
  activities: TrainingNoticeActivity[],
  filters: TrainingNoticeActivityFilters,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return activities.filter((activity) => {
    if (
      filters.competitionId &&
      activity.competitionId !== filters.competitionId
    ) {
      return false;
    }

    if (
      filters.activityType &&
      (activity.activityType ?? "") !== filters.activityType
    ) {
      return false;
    }

    if (normalizedSearch.length > 0) {
      return [activity.name, activity.competition?.name, activity.activityType]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    }

    return true;
  });
}

export function getTrainingNoticeStudentName(student: TrainingNoticeStudent) {
  return student.name || student.studentCode || "Selected student";
}

export function buildTrainingNoticeText({
  activity,
  student,
  whatToBring,
  settings,
}: {
  activity: TrainingNoticeActivity;
  student: TrainingNoticeStudent;
  whatToBring: string;
  settings: TrainingNoticeSettings;
}) {
  const studentName = getTrainingNoticeStudentName(student);

  return [
    settings.officialNoticeLabel,
    settings.noticeTitleChinese,
    settings.noticeSubtitleEnglish,
    "",
    settings.openingGreeting,
    "",
    settings.mainSentenceTemplate.replaceAll("{studentName}", studentName),
    "",
    `训练项目 / Training Activity: ${activity.name}`,
    `相关比赛 / Competition: ${formatNoticeField(activity.competition?.name ?? null)}`,
    `日期 / Date: ${formatTrainingNoticeDate(activity.startsAt)}`,
    `时间 / Time: ${formatTrainingNoticeTime(activity)}`,
    `地点 / Venue: ${formatNoticeField(activity.location)}`,
    `需携带物品 / What to Bring: ${formatNoticeField(whatToBring)}`,
    "",
    settings.reminderLine,
    settings.thankYouLine,
    "",
    settings.teacherDisplayName,
    settings.teacherRoleLabel,
    "",
    settings.footerNote,
  ].join("\n");
}

export function buildNoticeText(
  student: NoticeStudent,
  assignments: NoticeCompetitionAssignment[],
  settings: CompetitionNoticeSettings,
) {
  const studentName = getNoticeStudentName(student);
  const rows = assignments.map((assignment, index) => {
    const competition = assignment.competition;
    return [
      `${index + 1}. ${competition.name}`,
      `类别: ${formatNoticeField(competition.category)}`,
      `形式: ${formatNoticeField(competition.noticeMode)}`,
      `预计进行时段: ${formatNoticePeriod(competition)}`,
    ].join("\n");
  });

  return [
    settings.officialNoticeLabel,
    settings.noticeTitleChinese,
    settings.noticeSubtitleEnglish,
    "",
    settings.openingGreeting,
    "",
    settings.mainSentenceTemplate.replaceAll("{studentName}", studentName),
    "",
    rows.join("\n\n"),
    "",
    settings.trainingMessage,
    settings.supportMessage,
    settings.thankYouLine,
    "",
    settings.teacherDisplayName,
    settings.teacherRoleLabel,
    "",
    settings.footerNote,
  ].join("\n");
}
