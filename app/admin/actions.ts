"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string): Promise<{ error: string }> {
  if (!email.trim() || !password) {
    return { error: "Enter your email and password." };
  }
  if (!isSupabaseConfigured) {
    return { error: "Sign-in isn't available yet: the database isn't connected." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error) {
    // Same message for every failure so we don't reveal which emails exist.
    return { error: "That email and password don't match an admin account." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
