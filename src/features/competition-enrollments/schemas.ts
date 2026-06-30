import { z } from "zod";

export const competitionEnrollmentSchema = z.object({
  competitionId: z.string().uuid("Invalid competition id."),
  studentId: z.string().uuid("Choose a valid student."),
});

export const competitionEnrollmentIdSchema = z
  .string()
  .uuid("Invalid enrollment id.");

export type CompetitionEnrollmentValues = z.infer<
  typeof competitionEnrollmentSchema
>;
