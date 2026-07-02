import { z } from "zod";

export const teamIdSchema = z.string().uuid("Invalid team id.");
export const teamMemberIdSchema = z.string().uuid("Invalid team member id.");

const optionalText = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => (value.length > 0 ? value : null));

export const teamFormSchema = z.object({
  competitionId: z.string().uuid("Invalid competition id."),
  name: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(80, "Team name must be 80 characters or fewer."),
  description: optionalText(400, "Description must be 400 characters or fewer."),
});

export const teamUpdateSchema = teamFormSchema.extend({
  id: teamIdSchema,
});

export const teamAssignmentSchema = z.object({
  competitionId: z.string().uuid("Invalid competition id."),
  teamId: teamIdSchema,
  studentId: z.string().uuid("Choose a registered student."),
  role: optionalText(80, "Role must be 80 characters or fewer."),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
export type TeamUpdateValues = z.infer<typeof teamUpdateSchema>;
export type TeamAssignmentValues = z.infer<typeof teamAssignmentSchema>;
