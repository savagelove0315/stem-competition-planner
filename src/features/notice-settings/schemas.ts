import { z } from "zod";

export const legacyParentNoticeSettingsKey = "parent_notice_defaults";
export const competitionNoticeSettingsKey = "competition_notice_defaults";
export const trainingNoticeSettingsKey = "training_notice_defaults";

export const defaultCompetitionNoticeSettings = {
  teacherDisplayName: "Teacher Hilda",
  teacherRoleLabel: "负责老师",
  officialNoticeLabel: "OFFICIAL NOTICE",
  noticeTitleChinese: "STEM 比赛参与通知",
  noticeSubtitleEnglish: "STEM Competition Participation Notice",
  openingGreeting: "亲爱的家长：\n您好。",
  mainSentenceTemplate:
    "谨此通知，{studentName} 同学已被遴选 / 报名参加以下 STEM 相关比赛：",
  trainingMessage:
    "该学生可能需要在课后留下进行训练。具体训练日期与时间将会另行提前通知。",
  supportMessage:
    "恳请家长给予鼓励与支持，并提醒孩子认真参与训练，为比赛做好准备。",
  thankYouLine: "感谢您的配合与支持。",
  footerNote: "此通知供学生个人比赛参与确认用途。",
} as const;

export const defaultTrainingNoticeSettings = {
  teacherDisplayName: "Teacher Hilda",
  teacherRoleLabel: "负责老师",
  officialNoticeLabel: "OFFICIAL NOTICE",
  noticeTitleChinese: "训练通知",
  noticeSubtitleEnglish: "Training Notice",
  openingGreeting: "亲爱的家长：\n您好。",
  mainSentenceTemplate: "谨此通知，{studentName} 同学需要参加以下训练：",
  reminderLine: "请家长提醒孩子准时出席训练，并携带所需物品。",
  thankYouLine: "感谢您的配合与支持。",
  defaultWhatToBring:
    "Water bottle, stationery, competition materials, and any required devices.",
  footerNote: "此通知供学生个人训练安排用途。",
} as const;

function requiredText(max: number, label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
}

function requireStudentNameTemplate<
  TSchema extends z.ZodType<{ mainSentenceTemplate: string }>,
>(schema: TSchema) {
  return schema.superRefine((value, context) => {
    if (!value.mainSentenceTemplate.includes("{studentName}")) {
      context.addIssue({
        code: "custom",
        path: ["mainSentenceTemplate"],
        message: "Main sentence template must include {studentName}.",
      });
    }
  });
}

export const competitionNoticeSettingsSchema = requireStudentNameTemplate(
  z.object({
    teacherDisplayName: requiredText(120, "Teacher display name"),
    teacherRoleLabel: requiredText(80, "Teacher role label"),
    officialNoticeLabel: requiredText(80, "Official notice label"),
    noticeTitleChinese: requiredText(120, "Chinese notice title"),
    noticeSubtitleEnglish: requiredText(160, "English notice subtitle"),
    openingGreeting: requiredText(500, "Opening greeting"),
    mainSentenceTemplate: requiredText(500, "Main sentence template"),
    trainingMessage: requiredText(500, "Training message"),
    supportMessage: requiredText(500, "Support message"),
    thankYouLine: requiredText(240, "Thank you line"),
    footerNote: requiredText(240, "Footer note"),
  }),
);

export const trainingNoticeSettingsSchema = requireStudentNameTemplate(
  z.object({
    teacherDisplayName: requiredText(120, "Teacher display name"),
    teacherRoleLabel: requiredText(80, "Teacher role label"),
    officialNoticeLabel: requiredText(80, "Official notice label"),
    noticeTitleChinese: requiredText(120, "Chinese notice title"),
    noticeSubtitleEnglish: requiredText(160, "English notice subtitle"),
    openingGreeting: requiredText(500, "Opening greeting"),
    mainSentenceTemplate: requiredText(500, "Main sentence template"),
    reminderLine: requiredText(500, "Reminder line"),
    thankYouLine: requiredText(240, "Thank you line"),
    defaultWhatToBring: requiredText(500, "Default what to bring"),
    footerNote: requiredText(240, "Footer note"),
  }),
);

export type CompetitionNoticeSettingsFormValues = z.infer<
  typeof competitionNoticeSettingsSchema
>;
export type TrainingNoticeSettingsFormValues = z.infer<
  typeof trainingNoticeSettingsSchema
>;
