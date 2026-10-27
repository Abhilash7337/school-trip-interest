import Link from "next/link";
import { Suspense } from "react";
import { DeparturesBoard } from "@/components/departures-board";
import { PlaneIcon } from "@/components/icons";
import { TripPlanner } from "@/components/trip-planner";
import { getTrips } from "@/lib/data";

export default function Home() {
  return (
    <>
      <header className="bg-navy pb-9 pt-5 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-extrabold tracking-wide">
              <PlaneIcon className="size-5 rotate-90 text-signal" /> School Trips
            </span>
            <Link
              href="/admin"
              className="rounded-lg border border-white/25 px-3 py-1.5 font-mono text-xs hover:border-signal hover:text-signal"
            >
              Admin
            </Link>
          </div>

          <h1 className="mb-3 mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
            Departures
            <span className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-signal">2027 school season · from Hyderabad</span>
          </h1>
          <p className="mb-6 max-w-2xl text-[#c7d2ee]">
            Educational trips for school groups. Pick a destination, check the itinerary, and register your school&apos;s interest in about a minute. No payment needed.
          </p>

          <Suspense fallback={<BoardSkeleton />}>
            <Board />
          </Suspense>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<PassesSkeleton />}>
          <Planner />
        </Suspense>
      </main>

      <footer className="border-t border-rule py-6 text-center text-xs text-mute">
        School Trips · sample trips and indicative prices for this demo
      </footer>
    </>
  );
}

async function Board() {
  const trips = await getTrips();
  return trips?.length ? <DeparturesBoard trips={trips} /> : null;
}

async function Planner() {
  const trips = await getTrips();
  if (!trips?.length) {
    return (
      <div role="alert" className="mx-auto my-16 max-w-xl rounded-2xl bg-paper p-6 text-center">
        <h2 className="text-xl font-bold">Trips are unavailable right now</h2>
        <p className="mt-2 text-mute">We couldn&apos;t load the trip list. Please refresh the page in a minute.</p>
      </div>
    );
  }
  return <TripPlanner trips={trips} />;
}

function BoardSkeleton() {
  return <div className="h-[148px] animate-pulse rounded-xl bg-board" aria-hidden="true" />;
}

function PassesSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-20 sm:px-7 lg:grid-cols-3" aria-label="Loading trips">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-paper/70" />
      ))}
    </div>
  );
}
