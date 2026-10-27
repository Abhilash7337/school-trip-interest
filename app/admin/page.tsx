import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter, SiteHeader, headerButtonClass } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { SubmissionsPanel, type Submission, type TripTotal } from "@/components/submissions-panel";
import { formatDate } from "@/lib/format";
import { tripColor } from "@/lib/trips";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Interest report · School Trips admin" };

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

  // getClaims() checks the signed session token locally (no call to Supabase Auth).
  // proxy.ts has already redirected signed-out visitors; this is the page's own check.
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims) redirect("/admin/login");

  // One round trip for everything: admin check, per-trip totals and all rows.
  // RLS returns nothing (and zero totals) if this user isn't an admin.
  const [{ data: adminRow }, { data: totalsData }, { data: rowsData, error: rowsError }] = await Promise.all([
    supabase.from("admin_users").select("user_id").eq("user_id", claims.sub).maybeSingle(),
    supabase.from("trip_student_totals").select("trip_id, title, code, submission_count, total_students").order("sort_order"),
    supabase
      .from("interest_submissions")
      .select("id, created_at, teacher_name, school_name, email, phone, trip_id, student_count")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
  const email = typeof claims.email === "string" ? claims.email : "this account";
  if (!adminRow) return <NoAccess email={email} />;

  const totals = (totalsData ?? []) as TripTotal[];
  const rows = (rowsData ?? []) as Submission[];
  const { trip: tripParam } = await searchParams;
  const initialTrip = totals.some((t) => t.trip_id === tripParam) ? (tripParam as string) : null;
  const grandStudents = totals.reduce((sum, t) => sum + t.total_students, 0);
  const grandSubmissions = totals.reduce((sum, t) => sum + t.submission_count, 0);
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
        <p className="mt-2 text-sm text-mute">Signed in as {email}</p>
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

      {rowsError ? (
        <p role="alert" className="text-alert">
          Couldn&apos;t load submissions. Refresh to try again.
        </p>
      ) : (
        <SubmissionsPanel rows={rows} totals={totals} initialTrip={initialTrip} />
      )}
    </main>
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
