import { z } from "zod";

export const activityStatuses = [
  "draft",
  "planned",
  "active",
  "completed",
  "cancelled",
  "archived",
] as const;

export const activityTypes = [
  "Training",
  "Competition Day",
  "Selection",
  "Meeting",
  "Briefing",
  "Other",
] as const;

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

function optionalLimitedText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value.length > 0 ? value : null));
}

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .or(z.literal(""))
  .transform((value) => (value.length > 0 ? value : null));

const optionalTime = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}$/, "Use a valid time.")
  .or(z.literal(""))
  .transform((value) => (value.length > 0 ? value : null));

export const activityFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Activity name is required.")
      .max(160, "Activity name must be 160 characters or fewer."),
    competitionId: z.string().uuid("Choose a competition."),
    activityType: z.enum(activityTypes, {
      error: "Choose a valid activity type.",
    }),
    startDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required."),
    endDate: optionalDate,
    startTime: optionalTime,
    endTime: optionalTime,
    location: optionalLimitedText(
      160,
      "Location must be 160 characters or fewer.",
    ),
    capacity: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? Number(value) : null))
      .pipe(
        z
          .number("Capacity must be a number.")
          .int("Capacity must be a whole number.")
          .positive("Capacity must be greater than zero.")
          .nullable(),
      ),
    requiresTeam: z.boolean(),
    status: z.enum(activityStatuses, {
      error: "Choose a valid activity status.",
    }),
    description: optionalText,
    notes: optionalText,
  })
  .superRefine((value, context) => {
    const endDate = value.endDate ?? value.startDate;

    if (value.endDate && value.endDate < value.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date.",
      });
    }

    if (
      endDate === value.startDate &&
      value.startTime &&
      value.endTime &&
      value.endTime <= value.startTime
    ) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after the start time on the same date.",
      });
    }
  });

export const activityIdSchema = z.string().uuid("Invalid activity id.");

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
