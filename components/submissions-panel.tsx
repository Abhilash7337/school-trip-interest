"use client";

import { useState } from "react";
import { formatDate, formatPhone } from "@/lib/format";
import { toReference, tripColor } from "@/lib/trips";

export type Submission = {
  id: string;
  created_at: string;
  teacher_name: string;
  school_name: string;
  email: string;
  phone: string;
  trip_id: string;
  student_count: number;
};

export type TripTotal = { trip_id: string; title: string; code: string; submission_count: number; total_students: number };

// The submissions table with its trip filter. All rows arrive with the page,
// so switching trips is instant: no request, just filtering in the browser.
// The URL still updates (?trip=…) so a filtered view can be shared or refreshed.
export function SubmissionsPanel({ rows, totals, initialTrip }: { rows: Submission[]; totals: TripTotal[]; initialTrip: string | null }) {
  const [tripId, setTripId] = useState<string | null>(initialTrip);
  const activeTrip = totals.find((t) => t.trip_id === tripId);
  const tripById = new Map(totals.map((t) => [t.trip_id, t]));
  const shown = activeTrip ? rows.filter((r) => r.trip_id === activeTrip.trip_id) : rows;
  const shownStudents = shown.reduce((sum, r) => sum + r.student_count, 0);

  function choose(next: string | null) {
    setTripId(next);
    window.history.replaceState(null, "", next ? `/admin?trip=${next}` : "/admin");
  }

  const tabs = [{ id: null, label: "All trips", count: rows.length }, ...totals.map((t) => ({ id: t.trip_id, label: t.title, count: t.submission_count }))];

  return (
    <section aria-labelledby="submissions-h" className="grid gap-4 rounded-2xl border border-rule bg-paper p-5 sm:p-6">
      <h2 id="submissions-h" className="text-lg font-extrabold">
        Submissions
      </h2>
      <div role="group" aria-label="Filter by trip" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-rule">
        {tabs.map((tab) => {
          const active = (activeTrip?.trip_id ?? null) === tab.id;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => choose(tab.id)}
              aria-pressed={active}
              className={`-mb-px border-b-2 py-2.5 text-sm font-bold ${active ? "border-primary text-primary" : "border-transparent text-mute hover:text-ink"}`}
            >
              {tab.label} <span className="text-xs font-semibold opacity-70">({tab.count})</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-mute" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "submission" : "submissions"} · {shownStudents} students
        {activeTrip ? ` on ${activeTrip.title}` : " across all trips"}
      </p>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-mute">
          {activeTrip ? "No submissions for this trip yet." : "No submissions yet. Share the trips page with teachers to start collecting interest."}
        </p>
      ) : (
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-rule bg-mist text-left text-xs font-semibold text-mute">
                {["Received", "Reference", "Teacher", "School", "Email", "Phone", "Trip"].map((h, i) => (
                  <th key={h} className={`whitespace-nowrap py-3 pr-5 font-semibold ${i === 0 ? "pl-5 sm:pl-6" : ""}`}>
                    {h}
                  </th>
                ))}
                <th className="whitespace-nowrap py-3 pr-5 text-right font-semibold sm:pr-6">Students</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const trip = tripById.get(r.trip_id);
                const color = trip ? tripColor(trip.code) : undefined;
                return (
                  <tr key={r.id} className="border-b border-rule last:border-b-0 hover:bg-mist">
                    <td className="whitespace-nowrap py-3 pl-5 pr-5 sm:pl-6">{formatDate(r.created_at)}</td>
                    <td className="whitespace-nowrap py-3 pr-5 font-mono text-xs">{trip ? toReference(trip.code, r.id) : "—"}</td>
                    <td className="whitespace-nowrap py-3 pr-5 font-semibold">{r.teacher_name}</td>
                    <td className="min-w-48 py-3 pr-5">{r.school_name}</td>
                    <td className="whitespace-nowrap py-3 pr-5">{r.email}</td>
                    <td className="whitespace-nowrap py-3 pr-5">{formatPhone(r.phone)}</td>
                    <td className="whitespace-nowrap py-3 pr-5">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-bold"
                        style={color ? { color, background: `color-mix(in srgb, ${color} 12%, transparent)` } : undefined}
                      >
                        {trip?.title ?? r.trip_id}
                      </span>
                    </td>
                    <td className="py-3 pr-5 text-right font-bold sm:pr-6">{r.student_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
