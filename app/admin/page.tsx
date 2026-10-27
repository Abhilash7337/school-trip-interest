import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PlaneIcon } from "@/components/icons";
import { getTrips } from "@/lib/data";
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
    <div className="flex-1 bg-paper">
      <Suspense fallback={<ReportSkeleton />}>
        <Report searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Report({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const supabase = await createClient();

  // proxy.ts already redirects signed-out visitors; this is the real check.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return <NoAccess email={user.email ?? "this account"} />;

  const { trip: tripParam } = await searchParams;
  const trips = (await getTrips()) ?? [];
  const activeTrip = trips.find((t) => t.id === tripParam);

  let rowsQuery = supabase
    .from("interest_submissions")
    .select("id, created_at, teacher_name, school_name, email, phone, trip_id, student_count")
    .order("created_at", { ascending: false })
    .limit(500);
  if (activeTrip) rowsQuery = rowsQuery.eq("trip_id", activeTrip.id);

  const [{ data: totalsData }, { data: rowsData, error: rowsError }] = await Promise.all([
    supabase.from("trip_student_totals").select("trip_id, title, code, submission_count, total_students").order("sort_order"),
    rowsQuery,
  ]);

  const totals = (totalsData ?? []) as TripTotal[];
  const rows = (rowsData ?? []) as Submission[];
  const grandStudents = totals.reduce((sum, t) => sum + t.total_students, 0);
  const grandSubmissions = totals.reduce((sum, t) => sum + t.submission_count, 0);
  const tripById = new Map(trips.map((t) => [t.id, t]));
  const shownStudents = rows.reduce((sum, r) => sum + r.student_count, 0);
  const percent = (n: number) => (grandStudents ? Math.round((n / grandStudents) * 100) : 0);

  return (
    <>
      <AdminHeader email={user.email ?? ""} />

      <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-10 sm:px-7">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mute">Interest report · updated {formatDate(new Date().toISOString())}</p>
          <h1 className="mt-3 max-w-4xl text-balance font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            <b className="font-semibold">{grandStudents}</b> students across <b className="font-semibold">{grandSubmissions}</b>{" "}
            {grandSubmissions === 1 ? "school registration" : "school registrations"} want to travel next season.
          </h1>
        </div>

        {grandStudents > 0 && (
          <div className="flex h-3.5 overflow-hidden border border-navy" role="img" aria-label="Share of students by trip">
            {totals.map((t) => (
              <i key={t.trip_id} className="block h-full" style={{ width: `${percent(t.total_students)}%`, background: tripColor(t.code) }} />
            ))}
          </div>
        )}

        <section aria-label="Total students per trip" className="grid border-t-2 border-navy sm:grid-cols-3">
          {totals.map((t, i) => (
            <div key={t.trip_id} className={`grid gap-1 py-5 sm:pr-5 ${i > 0 ? "border-t border-rule sm:border-l sm:border-t-0 sm:pl-5" : ""}`}>
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="size-3" style={{ background: tripColor(t.code) }} aria-hidden="true" />
                {t.title}
              </h2>
              <b className="font-serif text-5xl font-normal leading-none tabular-nums">{t.total_students}</b>
              <span className="text-sm text-mute">
                students · {t.submission_count} {t.submission_count === 1 ? "school" : "schools"} · {percent(t.total_students)}%
              </span>
            </div>
          ))}
        </section>

        <section aria-labelledby="submissions-h" className="grid gap-4">
          <h2 id="submissions-h" className="sr-only">
            Submissions
          </h2>
          <nav aria-label="Filter by trip" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-rule">
            <FilterLink href="/admin" active={!activeTrip} label="All trips" count={grandSubmissions} />
            {totals.map((t) => (
              <FilterLink key={t.trip_id} href={`/admin?trip=${t.trip_id}`} active={activeTrip?.id === t.trip_id} label={t.title} count={t.submission_count} />
            ))}
          </nav>

          <p className="font-serif text-sm italic text-mute">
            Showing {rows.length} {rows.length === 1 ? "submission" : "submissions"} · {shownStudents} students
            {activeTrip ? ` on ${activeTrip.title}` : " across all trips"}
          </p>

          {rowsError ? (
            <p role="alert" className="text-alert">
              Couldn&apos;t load submissions. Refresh to try again.
            </p>
          ) : rows.length === 0 ? (
            <p className="py-8 font-serif italic text-mute">
              {activeTrip ? "No submissions for this trip yet." : "No submissions yet. Share the trips page with teachers to start collecting interest."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="border-b-[1.5px] border-navy text-left text-[0.68rem] uppercase tracking-[0.12em] text-mute">
                    {["Received", "Reference", "Teacher", "School", "Email", "Phone", "Trip"].map((h) => (
                      <th key={h} className="whitespace-nowrap py-3 pr-5 font-semibold">
                        {h}
                      </th>
                    ))}
                    <th className="whitespace-nowrap py-3 text-right font-semibold">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const trip = tripById.get(r.trip_id);
                    return (
                      <tr key={r.id} className="border-b border-rule hover:bg-sky/60">
                        <td className="whitespace-nowrap py-3 pr-5">{formatDate(r.created_at)}</td>
                        <td className="whitespace-nowrap py-3 pr-5 font-mono text-xs">{trip ? toReference(trip.code, r.id) : "—"}</td>
                        <td className="whitespace-nowrap py-3 pr-5 font-semibold">{r.teacher_name}</td>
                        <td className="min-w-48 py-3 pr-5">{r.school_name}</td>
                        <td className="whitespace-nowrap py-3 pr-5">{r.email}</td>
                        <td className="whitespace-nowrap py-3 pr-5">{formatPhone(r.phone)}</td>
                        <td className="whitespace-nowrap py-3 pr-5 font-serif italic" style={{ color: trip ? tripColor(trip.code) : undefined }}>
                          {trip?.title ?? r.trip_id}
                        </td>
                        <td className="py-3 text-right font-bold">{r.student_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function AdminHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-navy">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-7">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold">
          <PlaneIcon className="size-5 rotate-90 text-navy" />
          School Trips <span className="font-serif text-sm font-normal italic text-mute">admin</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <span className="mr-2 hidden text-mute md:inline">{email}</span>
          <Link href="/" className="rounded-lg px-3 py-2 font-semibold hover:bg-sky">
            Public site
          </Link>
          <form action={signOut}>
            <button type="submit" className="rounded-lg border border-navy px-3 py-2 font-semibold hover:bg-navy hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`-mb-px border-b-2 py-2.5 text-sm font-bold ${active ? "border-signal text-navy" : "border-transparent text-mute hover:text-navy"}`}
    >
      {label} <span className="font-mono text-xs font-normal">({count})</span>
    </Link>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-3xl">No admin access</h1>
        <p className="mt-3 text-mute">{email} is signed in but isn&apos;t on the admin list. Ask the team to add you, or sign in with a different account.</p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="rounded-lg bg-navy px-4 py-2.5 font-bold text-white">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl animate-pulse gap-6 px-4 pt-24 sm:px-7" aria-label="Loading report">
      <div className="h-12 w-3/4 rounded bg-sky" />
      <div className="h-24 rounded bg-sky" />
      <div className="h-64 rounded bg-sky" />
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
