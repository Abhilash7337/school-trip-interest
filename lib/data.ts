import { connection } from "next/server";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { TRIP_COLUMNS, type Trip } from "@/lib/trips";

// cache() de-duplicates this within one request, so the board and the
// planner can both ask for trips without a second database round trip.
export const getTrips = cache(async (): Promise<Trip[] | null> => {
  if (!isSupabaseConfigured) return null;
  // Read trips at request time so the page always shows the current list.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").select(TRIP_COLUMNS).order("sort_order");
  if (error) {
    console.error("load trips failed", error);
    return null;
  }
  return data as Trip[];
});
