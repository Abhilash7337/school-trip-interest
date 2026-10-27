"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { toReference } from "@/lib/trips";
import { firstErrors, interestSchema, type FieldErrors, type InterestValues } from "@/lib/validation";

export type Confirmation = {
  reference: string;
  teacherName: string;
  schoolName: string;
  email: string;
  tripTitle: string;
  tripCode: string;
  studentCount: number;
};

export type SubmitResult =
  | { ok: true; confirmation: Confirmation }
  | { ok: false; fieldErrors?: FieldErrors; message?: string };

export async function submitInterest(values: InterestValues & { website?: string }): Promise<SubmitResult> {
  // Honeypot: real people never see or fill the hidden "website" field,
  // so anything in it means a bot. Reject with a vague message.
  if (values.website) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const parsed = interestSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: firstErrors(parsed.error) };
  }
  const data = parsed.data;

  if (!isSupabaseConfigured) {
    return { ok: false, message: "Registrations aren't open yet. Please try again later." };
  }

  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code, title")
    .eq("id", data.trip_id)
    .maybeSingle();
  if (!trip) {
    return { ok: false, fieldErrors: { trip_id: "Choose one of the trips." } };
  }

  // The id is generated here because anonymous visitors may insert but not
  // read rows back, so we can't ask Supabase to return the new row.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("interest_submissions").insert({ id, ...data });

  if (error) {
    console.error("insert interest_submissions failed", error);
    return { ok: false, message: "We couldn't save your interest just now. Please try again in a minute." };
  }

  return {
    ok: true,
    confirmation: {
      reference: toReference(trip.code, id),
      teacherName: data.teacher_name,
      schoolName: data.school_name,
      email: data.email,
      tripTitle: trip.title,
      tripCode: trip.code,
      studentCount: data.student_count,
    },
  };
}
