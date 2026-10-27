import { z } from "zod";

// One schema shared by the browser (step-by-step checks) and the Server
// Action (the real gate before anything touches the database).

const STUDENTS_MESSAGE = "Enter a whole number from 1 to 500.";

// Accepts "98490 12345", "+91 98490-12345", "098490 12345" → "9849012345".
export function toTenDigits(raw: string) {
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export const interestSchema = z.object({
  trip_id: z.string().min(1, "Choose one of the trips."),
  school_name: z
    .string()
    .trim()
    .min(2, "Enter your school's name.")
    .max(150, "School name must be 150 characters or fewer.")
    .regex(/^[\p{L}\p{N} .,'&()/-]+$/u, "Use letters, numbers and simple punctuation only."),
  student_count: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, STUDENTS_MESSAGE)
    .transform(Number)
    .pipe(z.number().int(STUDENTS_MESSAGE).min(1, STUDENTS_MESSAGE).max(500, STUDENTS_MESSAGE)),
  teacher_name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name must be 100 characters or fewer.")
    .regex(/^[\p{L} .'-]+$/u, "Use letters only. Spaces, dots, apostrophes and hyphens are fine."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long.")
    .pipe(z.email("Enter a valid email, like name@school.edu.in.")),
  phone: z
    .string()
    .transform(toTenDigits)
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."))
    .transform((digits) => `+91${digits}`),
});

export type InterestField = keyof typeof interestSchema.shape;
export type InterestValues = Record<InterestField, string>;
export type FieldErrors = Partial<Record<InterestField, string>>;

export const INTEREST_FIELDS = Object.keys(interestSchema.shape) as InterestField[];

// The check-in form asks for these fields on each of its three steps.
export const STEP_FIELDS: Record<1 | 2 | 3, InterestField[]> = {
  1: ["trip_id"],
  2: ["school_name", "student_count"],
  3: ["teacher_name", "email", "phone"],
};

export function firstErrors(error: z.ZodError): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  const result: FieldErrors = {};
  for (const field of INTEREST_FIELDS) {
    const messages = (fieldErrors as Record<string, string[] | undefined>)[field];
    if (messages?.length) result[field] = messages[0];
  }
  return result;
}
