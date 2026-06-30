import { z } from "zod";

export const activityParticipantStatuses = [
  "assigned",
  "attended",
  "absent",
  "cancelled",
] as const;

export const activityParticipantAssignmentSchema = z.object({
  activityId: z.string().uuid("Invalid activity id."),
  competitionId: z.string().uuid("Invalid competition id."),
  studentId: z.string().uuid("Choose a student."),
});

export const activityParticipantIdSchema = z
  .string()
  .uuid("Invalid participant id.");

export type ActivityParticipantAssignmentValues = z.infer<
  typeof activityParticipantAssignmentSchema
>;
