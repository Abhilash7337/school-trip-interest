import { formatInr, shortDuration, tripColor, type Trip } from "@/lib/trips";
import { DestinationArt } from "./destination-art";
import { PinIcon, PlaneIcon } from "./icons";

type Props = {
  trip: Trip;
  selected: boolean;
  onSelect: () => void;
  onShowDetails: () => void;
};

const PREVIEW_PLACES = 4;

// One trip as a full-width boarding pass: a picture panel of the destination,
// the route and key facts, and a tear-off stub with the price and Select.
export function BoardingPass({ trip, selected, onSelect, onShowDetails }: Props) {
  const city = trip.destination.split(",")[0];
  const morePlaces = trip.places.length - PREVIEW_PLACES;
  const color = tripColor(trip.code);

  return (
    <article
      aria-label={trip.title}
      className={`grid rounded-2xl border bg-paper transition-shadow duration-200 hover:shadow-[0_18px_34px_-22px_rgba(15,27,42,0.35)] md:grid-cols-[220px_minmax(0,1fr)_170px] ${
        selected ? "border-primary ring-2 ring-primary" : "border-rule"
      }`}
    >
      {/* Destination panel */}
      <div
        className="relative flex min-h-36 flex-col justify-between overflow-hidden rounded-t-2xl p-5 text-white md:rounded-l-2xl md:rounded-tr-none"
        style={{ background: `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 50%, #000))` }}
      >
        <div className="relative z-10">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[0.7rem] font-bold">{trip.season}</span>
          <p className="mt-3 text-2xl font-extrabold leading-tight">{city}</p>
          <p className="text-xs font-semibold text-white/80">{trip.duration}</p>
        </div>
        <DestinationArt code={trip.code} className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] w-full text-white/30" />
      </div>

      {/* Ticket body */}
      <div
        className="grid min-w-0 content-start gap-4 p-5 sm:p-6"
        style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${color} 6%, transparent), transparent 55%)` }}
      >
        <div className="flex items-center gap-4">
          <div>
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">From</small>
            <b className="text-2xl font-extrabold leading-none tracking-tight">HYD</b>
          </div>
          <div className="relative h-0.5 max-w-48 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-rule-strong)_0_6px,transparent_6px_11px)]">
            <PlaneIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rotate-90" />
          </div>
          <div>
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">To</small>
            <b className="text-2xl font-extrabold leading-none tracking-tight" style={{ color }}>
              {trip.code}
            </b>
          </div>
          <h3 className="ml-2 hidden text-xl font-bold leading-snug lg:block">{trip.title}</h3>
        </div>
        <h3 className="text-xl font-bold leading-snug lg:hidden">{trip.title}</h3>

        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            ["Duration", shortDuration(trip.duration)],
            ["Grades", trip.grades.replace("Grades ", "")],
            ["Departs", trip.season],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.7rem] font-semibold text-mute">{label}</dt>
              <dd className="text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="max-w-[70ch] text-sm text-mute">{trip.summary}</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Places covered">
          {trip.places.slice(0, PREVIEW_PLACES).map((place) => (
            <li key={place} className="flex items-center gap-1 rounded-full border border-rule bg-paper px-2.5 py-1 text-xs font-semibold">
              <PinIcon className="size-3.5 text-mute" />
              {place}
            </li>
          ))}
          {morePlaces > 0 && <li className="px-1 py-1 text-xs font-semibold text-mute">+{morePlaces} more</li>}
        </ul>

        <button
          type="button"
          onClick={onShowDetails}
          className="justify-self-start rounded-md text-sm font-bold text-primary underline-offset-4 hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View itinerary &amp; places →
        </button>
      </div>

      {/* Tear-off stub */}
      <div className="pass-stub flex items-center justify-between gap-3 px-5 py-4 md:grid md:content-center md:justify-items-center md:text-center">
        <div>
          <small className="block text-[0.7rem] font-semibold text-mute">From, per student</small>
          <b className="text-lg leading-tight">{formatInr(trip.price_from_inr)}</b>
        </div>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`rounded-[10px] px-5 py-2.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:mt-2 ${
            selected ? "bg-primary text-on-primary" : "border border-rule-strong bg-paper hover:border-primary hover:text-primary"
          }`}
        >
          {selected ? "Selected ✓" : "Select trip"}
        </button>
      </div>
    </article>
  );
}
