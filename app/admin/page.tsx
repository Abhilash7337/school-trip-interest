import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter, SiteHeader, headerButtonClass } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { toReference, tripColor } from "@/lib/trips";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Interest report · School Trips admin" };

type Submission = {
  id: string;
  created_at: string;
  teacher_name: string;
  school_name: string;
  email: string;
  phone: string;
  trip_id: string;
  student_count: number;
};

type TripTotal = { trip_id: string; title: string; code: string; submission_count: number; total_students: number };

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <SiteHeader
        label="Admin"
        actions={
          <>
            <Link href="/" className={headerButtonClass}>
              Trips page
            </Link>
            <form action={signOut}>
              <button type="submit" className={headerButtonClass}>
                Log out
              </button>
            </form>
          </>
        }
      />
      <div className="flex-1">
        <Suspense fallback={<ReportSkeleton />}>
          <Report searchParams={searchParams} />
        </Suspense>
      </div>
      <SiteFooter />
    </>
  );
}

async function Report({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  if (!isSupabaseConfigured) redirect("/admin/login");
  // Always render per request: the report reads live data and shows the current time.
  await connection();
  const supabase = await createClient();

  // proxy.ts already redirects signed-out visitors; this is the real check.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // The admin check and the per-trip totals don't depend on each other, so fetch them together.
  // (If the user isn't an admin, RLS makes the totals view return zeros, so nothing leaks.)
  const [{ data: adminRow }, { data: totalsData }] = await Promise.all([
    supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("trip_student_totals").select("trip_id, title, code, submission_count, total_students").order("sort_order"),
  ]);
  if (!adminRow) return <NoAccess email={user.email ?? "this account"} />;

  const totals = (totalsData ?? []) as TripTotal[];
  const { trip: tripParam } = await searchParams;
  // Only filter by a trip that actually exists; anything else shows all trips.
  const activeTrip = totals.find((t) => t.trip_id === tripParam);

  let rowsQuery = supabase
    .from("interest_submissions")
    .select("id, created_at, teacher_name, school_name, email, phone, trip_id, student_count")
    .order("created_at", { ascending: false })
    .limit(500);
  if (activeTrip) rowsQuery = rowsQuery.eq("trip_id", activeTrip.trip_id);
  const { data: rowsData, error: rowsError } = await rowsQuery;

  const rows = (rowsData ?? []) as Submission[];
  const grandStudents = totals.reduce((sum, t) => sum + t.total_students, 0);
  const grandSubmissions = totals.reduce((sum, t) => sum + t.submission_count, 0);
  const tripById = new Map(totals.map((t) => [t.trip_id, t]));
  const shownStudents = rows.reduce((sum, r) => sum + r.student_count, 0);
  const percent = (n: number) => (grandStudents ? Math.round((n / grandStudents) * 100) : 0);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-10 sm:px-7">
      <div>
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          Interest report · updated {formatDate(new Date().toISOString())}
        </span>
        <h1 className="mt-4 max-w-4xl text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
          <span className="text-primary">{grandStudents}</span> students across <span className="text-primary">{grandSubmissions}</span>{" "}
          {grandSubmissions === 1 ? "school registration" : "school registrations"} want to travel next season.
        </h1>
        <p className="mt-2 text-sm text-mute">Signed in as {user.email}</p>
      </div>

      {grandStudents > 0 && (
        <div className="flex h-3 overflow-hidden rounded-full bg-rule" role="img" aria-label="Share of students by trip">
          {totals.map((t) => (
            <i key={t.trip_id} className="block h-full" style={{ width: `${percent(t.total_students)}%`, background: tripColor(t.code) }} />
          ))}
        </div>
      )}

      <section aria-label="Total students per trip" className="grid gap-4 sm:grid-cols-3">
        {totals.map((t) => (
          <div key={t.trip_id} className="grid gap-1 rounded-2xl border border-rule bg-paper p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <span className="size-2.5 rounded-full" style={{ background: tripColor(t.code) }} aria-hidden="true" />
              {t.title}
            </h2>
            <b className="mt-1 text-4xl font-extrabold leading-none tracking-tight tabular-nums">{t.total_students}</b>
            <span className="text-sm text-mute">
              students · {t.submission_count} {t.submission_count === 1 ? "school" : "schools"} · {percent(t.total_students)}%
            </span>
          </div>
        ))}
      </section>

      <section aria-labelledby="submissions-h" className="grid gap-4 rounded-2xl border border-rule bg-paper p-5 sm:p-6">
        <h2 id="submissions-h" className="text-lg font-extrabold">
          Submissions
        </h2>
        <nav aria-label="Filter by trip" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-rule">
          <FilterLink href="/admin" active={!activeTrip} label="All trips" count={grandSubmissions} />
          {totals.map((t) => (
            <FilterLink key={t.trip_id} href={`/admin?trip=${t.trip_id}`} active={activeTrip?.trip_id === t.trip_id} label={t.title} count={t.submission_count} />
          ))}
        </nav>

        <p className="text-sm text-mute">
          Showing {rows.length} {rows.length === 1 ? "submission" : "submissions"} · {shownStudents} students
          {activeTrip ? ` on ${activeTrip.title}` : " across all trips"}
        </p>

        {rowsError ? (
          <p role="alert" className="text-alert">
            Couldn&apos;t load submissions. Refresh to try again.
          </p>
        ) : rows.length === 0 ? (
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
                {rows.map((r) => {
                  const trip = tripById.get(r.trip_id);
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
                          style={trip ? { color: tripColor(trip.code), background: `color-mix(in srgb, ${tripColor(trip.code)} 12%, transparent)` } : undefined}
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
    </main>
  );
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    // No prefetch: each filter view is a fresh database query, so only load it when clicked.
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`-mb-px border-b-2 py-2.5 text-sm font-bold ${active ? "border-primary text-primary" : "border-transparent text-mute hover:text-ink"}`}
    >
      {label} <span className="text-xs font-semibold opacity-70">({count})</span>
    </Link>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-24">
      <div className="grid max-w-md gap-3 rounded-2xl border border-rule bg-paper p-7 text-center">
        <h1 className="text-2xl font-extrabold">No admin access</h1>
        <p className="text-mute">{email} is signed in but isn&apos;t on the admin list. Ask the team to add you, or sign in with a different account.</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="rounded-[10px] bg-primary px-4 py-2.5 font-bold text-on-primary hover:bg-primary-hover">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl animate-pulse gap-6 px-4 pt-10 sm:px-7" aria-label="Loading report">
      <div className="h-12 w-3/4 rounded-xl bg-rule" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-rule" />
        <div className="h-28 rounded-2xl bg-rule" />
        <div className="h-28 rounded-2xl bg-rule" />
      </div>
      <div className="h-64 rounded-2xl bg-rule" />
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
