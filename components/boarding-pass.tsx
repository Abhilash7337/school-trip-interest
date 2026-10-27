import { formatInr, shortDuration, type Trip } from "@/lib/trips";
import { PinIcon, PlaneIcon } from "./icons";

type Props = {
  trip: Trip;
  selected: boolean;
  onSelect: () => void;
  onShowDetails: () => void;
};

const PREVIEW_PLACES = 3;

// One trip shown as a boarding pass: route, key facts, a preview of places,
// and a tear-off stub with the price and the Select button.
export function BoardingPass({ trip, selected, onSelect, onShowDetails }: Props) {
  const city = trip.destination.split(",")[0];
  const morePlaces = trip.places.length - PREVIEW_PLACES;

  return (
    <article
      aria-label={trip.title}
      className={`grid snap-start grid-cols-[minmax(0,1fr)_104px] rounded-2xl bg-paper drop-shadow-[0_8px_16px_rgba(14,27,61,0.12)] transition-transform duration-200 hover:-translate-y-1 ${
        selected ? "outline-3 outline-offset-2 outline-signal" : ""
      }`}
    >
      <div className="grid min-w-0 content-start gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">From</small>
            <b className="text-3xl font-extrabold leading-none tracking-tight">HYD</b>
            <span className="block text-xs text-mute">Hyderabad</span>
          </div>
          <div className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-rule)_0_6px,transparent_6px_11px)]">
            <PlaneIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-paper px-0.5 text-navy" />
          </div>
          <div className="text-right">
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">To</small>
            <b className="text-3xl font-extrabold leading-none tracking-tight">{trip.code}</b>
            <span className="block text-xs text-mute">{city}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold leading-snug">{trip.title}</h3>

        <dl className="grid grid-cols-3 gap-2">
          {[
            ["Duration", shortDuration(trip.duration)],
            ["Class", trip.grades.replace("Grades ", "Gr ")],
            ["Departs", trip.season.replace("December", "Dec")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">{label}</dt>
              <dd className="text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-sm text-mute">{trip.summary}</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Places covered">
          {trip.places.slice(0, PREVIEW_PLACES).map((place) => (
            <li key={place} className="flex items-center gap-1 rounded-full bg-sky px-2.5 py-1 text-xs font-semibold">
              <PinIcon className="size-3.5 text-mute" />
              {place}
            </li>
          ))}
          {morePlaces > 0 && <li className="rounded-full px-1 py-1 text-xs font-semibold text-mute">+{morePlaces} more</li>}
        </ul>

        <button
          type="button"
          onClick={onShowDetails}
          className="justify-self-start rounded-lg py-1 text-sm font-bold text-navy underline decoration-signal decoration-2 underline-offset-4 hover:decoration-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          View itinerary &amp; places →
        </button>
      </div>

      <div className="pass-stub grid content-center justify-items-center gap-1.5 px-2 py-4 text-center">
        <small className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">From</small>
        <b className="text-base leading-tight">{formatInr(trip.price_from_inr)}</b>
        <small className="text-[0.65rem] text-mute">per student</small>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`mt-1 rounded-lg px-3 py-2 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
            selected ? "bg-signal text-navy" : "bg-navy text-white hover:bg-[#1b2e63]"
          }`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </article>
  );
}
