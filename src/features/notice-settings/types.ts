export type CompetitionNoticeSettings = {
  teacherDisplayName: string;
  teacherRoleLabel: string;
  officialNoticeLabel: string;
  noticeTitleChinese: string;
  noticeSubtitleEnglish: string;
  openingGreeting: string;
  mainSentenceTemplate: string;
  trainingMessage: string;
  supportMessage: string;
  thankYouLine: string;
  footerNote: string;
};

export type TrainingNoticeSettings = {
  teacherDisplayName: string;
  teacherRoleLabel: string;
  officialNoticeLabel: string;
  noticeTitleChinese: string;
  noticeSubtitleEnglish: string;
  openingGreeting: string;
  mainSentenceTemplate: string;
  reminderLine: string;
  thankYouLine: string;
  defaultWhatToBring: string;
  footerNote: string;
};

export type NoticeSettingsActionStatus = "idle" | "success" | "error";

export type NoticeSettingsActionState<TFields extends string> = {
  status: NoticeSettingsActionStatus;
  message: string | null;
  fieldErrors?: Partial<Record<TFields, string[]>>;
};
