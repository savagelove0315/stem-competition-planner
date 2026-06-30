import type {
  NoticeCompetition,
  NoticeCompetitionAssignment,
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

  const formatter = new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

export function buildNoticeText(
  student: NoticeStudent,
  assignments: NoticeCompetitionAssignment[],
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
    "STEM 比赛参与通知",
    "STEM Competition Participation Notice",
    "",
    "亲爱的家长：",
    "您好。",
    "",
    `谨此通知，${studentName} 同学已被遴选 / 报名参加以下 STEM 相关比赛：`,
    "",
    rows.join("\n\n"),
    "",
    "该学生可能需要在课后留下进行训练。具体训练日期与时间将会另行提前通知。",
    "恳请家长给予鼓励与支持，并提醒孩子认真参与训练，为比赛做好准备。",
    "感谢您的配合与支持。",
    "",
    "Teacher Hilda",
    "负责老师",
    "",
    "此通知供学生个人比赛参与确认用途。",
  ].join("\n");
}
