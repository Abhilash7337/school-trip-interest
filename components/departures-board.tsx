import type { Trip } from "@/lib/trips";

// Split-flap style board listing the trips, like an airport departures screen.
export function DeparturesBoard({ trips }: { trips: Trip[] }) {
  return (
    <div role="table" aria-label="Upcoming trips" className="grid gap-1.5 rounded-xl bg-board p-3 font-mono">
      <div role="row" className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-2 text-[0.66rem] tracking-[0.14em] text-board-mute">
        <span role="columnheader">TO</span>
        <span role="columnheader">TRIP</span>
        <span role="columnheader" className="hidden sm:block">DEPARTS</span>
        <span role="columnheader">STATUS</span>
      </div>
      {trips.map((trip, row) => (
        <div
          key={trip.id}
          role="row"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 rounded-md px-2 py-1.5"
        >
          <span role="cell" className="flex gap-[3px]" aria-label={trip.code}>
            {[...trip.code].map((letter, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="flap-in relative grid h-[1.95em] w-[1.55em] place-items-center rounded-[3px] bg-navy-2 text-base font-semibold text-signal after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/45"
                style={{ animationDelay: `${(row * 3 + i) * 70}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
          <span role="cell" className="truncate text-sm text-white">
            {trip.title.toUpperCase()}
          </span>
          <span role="cell" className="hidden text-xs text-[#c7d2ee] sm:block">
            {trip.season.toUpperCase()}
          </span>
          <span role="cell" className="rounded bg-signal px-2 py-0.5 text-[0.7rem] font-semibold text-board">
            OPEN
          </span>
        </div>
      ))}
    </div>
  );
}
