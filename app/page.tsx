import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader, headerButtonClass } from "@/components/site-header";
import { TripPlanner } from "@/components/trip-planner";
import { getTrips } from "@/lib/data";

export default function Home() {
  return (
    <>
      <SiteHeader
        nav={
          <nav aria-label="Sections" className="hidden gap-1 text-sm font-semibold text-mute sm:flex">
            <a href="#trips" className="rounded-lg px-2.5 py-2 hover:bg-mist hover:text-ink">
              Trips
            </a>
            <a href="#register" className="rounded-lg px-2.5 py-2 hover:bg-mist hover:text-ink">
              Register
            </a>
          </nav>
        }
        actions={
          // No prefetch: visitors rarely open admin, and prefetching it would run an auth check on every page view.
          <Link href="/admin" prefetch={false} className={headerButtonClass}>
            Admin
          </Link>
        }
      />

      <main className="flex-1">
        <Suspense fallback={<PlannerSkeleton />}>
          <Planner />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}

async function Planner() {
  const trips = await getTrips();
  if (!trips?.length) {
    return (
      <div role="alert" className="mx-auto my-20 max-w-xl rounded-2xl border border-rule bg-paper p-7 text-center">
        <h1 className="text-xl font-bold">Trips are unavailable right now</h1>
        <p className="mt-2 text-mute">We couldn&apos;t load the trip list. Please refresh the page in a minute.</p>
      </div>
    );
  }
  return <TripPlanner trips={trips} />;
}

function PlannerSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl animate-pulse gap-10 px-4 py-14 sm:px-7 lg:grid-cols-2" aria-label="Loading trips">
      <div className="grid gap-4">
        <div className="h-7 w-56 rounded-full bg-rule" />
        <div className="h-28 rounded-xl bg-rule" />
        <div className="h-16 rounded-xl bg-rule" />
      </div>
      <div className="h-96 rounded-2xl bg-paper" />
    </div>
  );
}
