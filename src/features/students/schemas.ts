import { z } from "zod";

export const studentStatuses = ["active", "inactive", "archived"] as const;

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

const optionalMyKidNumber = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine(
    (value) => value.length === 0 || /^\d{12}$/.test(value),
    "MyKid number must contain exactly 12 digits.",
  )
  .transform((value) => (value.length > 0 ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.email("Enter a valid email address.").nullable());

export const studentFormSchema = z.object({
  studentCode: optionalLimitedText(
    64,
    "Student code must be 64 characters or fewer.",
  ),
  myKidNumber: optionalMyKidNumber,
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(80, "First name must be 80 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(80, "Last name must be 80 characters or fewer."),
  displayName: optionalLimitedText(
    160,
    "Display name must be 160 characters or fewer.",
  ),
  className: optionalLimitedText(
    80,
    "Class name must be 80 characters or fewer.",
  ),
  gradeLevel: optionalLimitedText(
    40,
    "Grade or year must be 40 characters or fewer.",
  ),
  email: optionalEmail,
  phone: optionalLimitedText(40, "Phone must be 40 characters or fewer."),
  guardianName: optionalLimitedText(
    120,
    "Guardian name must be 120 characters or fewer.",
  ),
  guardianContact: optionalLimitedText(
    120,
    "Guardian contact must be 120 characters or fewer.",
  ),
  parentContact: optionalLimitedText(
    120,
    "Parent contact must be 120 characters or fewer.",
  ),
  status: z.enum(studentStatuses, {
    error: "Choose a valid student status.",
  }),
  notes: optionalText,
  competitionIds: z.array(z.string().uuid("Invalid competition id.")),
});

export const studentIdSchema = z.string().uuid("Invalid student id.");

export type StudentFormValues = z.infer<typeof studentFormSchema>;

export function isValidStoredMyKidNumber(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && /^\d{12}$/.test(value);
}

export function formatMyKidNumber(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  if (!isValidStoredMyKidNumber(value)) {
    return "Invalid saved value";
  }

  return `${value.slice(0, 6)}-${value.slice(6, 8)}-${value.slice(8)}`;
}

export function getMyKidFormValue(value: string | null | undefined) {
  return isValidStoredMyKidNumber(value) ? formatMyKidNumber(value) : "";
}
