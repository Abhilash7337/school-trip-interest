import Link from "next/link";
import { Suspense } from "react";
import { TripPlanner } from "@/components/trip-planner";
import { getTrips } from "@/lib/data";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold">
            <span className="grid size-8 place-items-center rounded-[9px] bg-primary text-xs font-extrabold text-white">ST</span>
            School Trips
          </Link>
          <nav aria-label="Sections" className="hidden gap-1 text-sm font-semibold text-mute sm:flex">
            <a href="#trips" className="rounded-lg px-2.5 py-2 hover:bg-mist hover:text-ink">
              Trips
            </a>
            <a href="#register" className="rounded-lg px-2.5 py-2 hover:bg-mist hover:text-ink">
              Register
            </a>
          </nav>
          <Link href="/admin" className="ml-auto rounded-[10px] border border-rule px-3.5 py-2 text-sm font-bold hover:border-primary">
            Admin
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<PlannerSkeleton />}>
          <Planner />
        </Suspense>
      </main>

      <footer className="border-t border-rule py-6 text-center text-xs text-mute">
        School Trips · sample trips and indicative prices for this demo
      </footer>
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
