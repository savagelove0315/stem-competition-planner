import type {
  NoticeSettings,
} from "@/features/notice-settings/types";
import type {
  NoticeCompetition,
  NoticeCompetitionAssignment,
  NoticeStudentFilters,
  NoticeStudent,
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

export function buildNoticeText(
  student: NoticeStudent,
  assignments: NoticeCompetitionAssignment[],
  settings: NoticeSettings,
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
    "OFFICIAL NOTICE",
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
