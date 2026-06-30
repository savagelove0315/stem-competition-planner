import { z } from "zod";

export const noticeSettingsKey = "parent_notice_defaults";

export const defaultNoticeSettings = {
  teacherDisplayName: "Teacher Hilda",
  teacherRoleLabel: "负责老师",
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

function requiredText(max: number, label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
}

export const noticeSettingsSchema = z
  .object({
    teacherDisplayName: requiredText(120, "Teacher display name"),
    teacherRoleLabel: requiredText(80, "Teacher role label"),
    noticeTitleChinese: requiredText(120, "Chinese notice title"),
    noticeSubtitleEnglish: requiredText(160, "English notice subtitle"),
    openingGreeting: requiredText(500, "Opening greeting"),
    mainSentenceTemplate: requiredText(500, "Main sentence template"),
    trainingMessage: requiredText(500, "Training message"),
    supportMessage: requiredText(500, "Support message"),
    thankYouLine: requiredText(240, "Thank you line"),
    footerNote: requiredText(240, "Footer note"),
  })
  .superRefine((value, context) => {
    if (!value.mainSentenceTemplate.includes("{studentName}")) {
      context.addIssue({
        code: "custom",
        path: ["mainSentenceTemplate"],
        message: "Main sentence template must include {studentName}.",
      });
    }
  });

export type NoticeSettingsFormValues = z.infer<typeof noticeSettingsSchema>;
