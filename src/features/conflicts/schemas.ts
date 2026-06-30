import { z } from "zod";

export const conflictReviewIntentSchema = z.enum([
  "review",
  "resolve",
  "reopen",
  "save-note",
]);

export const conflictReviewActionSchema = z.object({
  intent: conflictReviewIntentSchema,
  conflictKey: z.string().trim().min(1, "Missing conflict identity."),
  studentId: z.string().uuid("Invalid student id."),
  studentName: z.string().trim().min(1, "Missing student name."),
  activityOneId: z.string().uuid("Invalid first activity id."),
  activityOneCompetitionId: z.string().uuid("Invalid first competition id."),
  activityOneName: z.string().trim().min(1, "Missing first activity name."),
  activityTwoId: z.string().uuid("Invalid second activity id."),
  activityTwoCompetitionId: z.string().uuid("Invalid second competition id."),
  activityTwoName: z.string().trim().min(1, "Missing second activity name."),
  conflictStartDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid conflict start date."),
  conflictEndDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid conflict end date."),
  conflictDateLabel: z.string().trim().min(1, "Missing conflict date label."),
  severity: z.enum(["serious", "mild", "warning"]),
  reason: z.string().trim().min(1, "Missing conflict reason."),
  suggestedAction: z.string().trim().min(1, "Missing suggested action."),
  teacherNote: z
    .string()
    .trim()
    .max(2000, "Teacher note must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null)),
  resolutionNote: z
    .string()
    .trim()
    .max(2000, "Resolution note must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null)),
});

export type ConflictReviewActionValues = z.infer<
  typeof conflictReviewActionSchema
>;

export type ConflictReviewActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<keyof ConflictReviewActionValues, string[]>>;
};
