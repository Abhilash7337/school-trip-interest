"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Returns an error message, or null on success. The form then navigates to
// /admin itself: redirecting from here would render the admin page inside this
// response, before the new session cookie reaches the browser.
export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  if (!email.trim() || !password) {
    return { error: "Enter your email and password." };
  }
  if (!isSupabaseConfigured) {
    return { error: "Sign-in isn't available yet: the database isn't connected." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error) {
    // Logged on the server only (e.g. invalid_credentials, email_not_confirmed).
    console.warn("admin sign-in failed:", error.code ?? error.message);
    // Same message for every failure so we don't reveal which emails exist.
    return { error: "That email and password don't match an admin account." };
  }
  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
