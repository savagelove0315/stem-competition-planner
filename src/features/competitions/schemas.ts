import { z } from "zod";

export const competitionStatuses = [
  "draft",
  "planned",
  "active",
  "completed",
  "archived",
] as const;

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalDateTime = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const competitionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Competition name is required.")
      .max(120, "Competition name must be 120 characters or fewer."),
    description: optionalText,
    status: z.enum(competitionStatuses, {
      error: "Choose a valid competition status.",
    }),
    startsAt: optionalDateTime,
    endsAt: optionalDateTime,
    registrationOpensAt: optionalDateTime,
    registrationClosesAt: optionalDateTime,
    notes: optionalText,
  })
  .superRefine((value, context) => {
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be after the start date.",
      });
    }

    if (
      value.registrationOpensAt &&
      value.registrationClosesAt &&
      value.registrationClosesAt <= value.registrationOpensAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["registrationClosesAt"],
        message: "Registration close date must be after the open date.",
      });
    }
  });

export const competitionIdSchema = z.string().uuid("Invalid competition id.");

export type CompetitionFormValues = z.infer<typeof competitionFormSchema>;
