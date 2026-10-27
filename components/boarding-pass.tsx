import { formatInr, shortDuration, tripColor, type Trip } from "@/lib/trips";
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
  const color = tripColor(trip.code);

  return (
    <article
      aria-label={trip.title}
      className={`grid snap-start grid-cols-[minmax(0,1fr)_112px] rounded-2xl border bg-paper transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_-20px_rgba(15,27,42,0.35)] ${
        selected ? "border-primary ring-2 ring-primary" : "border-rule"
      }`}
    >
      <div className="grid min-w-0 content-start gap-3.5 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">From</small>
            <b className="text-[1.7rem] font-extrabold leading-none tracking-tight">HYD</b>
            <span className="block text-xs text-mute">Hyderabad</span>
          </div>
          <div className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-rule-strong)_0_6px,transparent_6px_11px)]">
            <PlaneIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-paper px-0.5" />
          </div>
          <div className="text-right">
            <small className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-mute">To</small>
            <b className="text-[1.7rem] font-extrabold leading-none tracking-tight" style={{ color }}>
              {trip.code}
            </b>
            <span className="block text-xs text-mute">{city}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold leading-snug">{trip.title}</h3>

        <dl className="grid grid-cols-3 gap-2 rounded-xl bg-mist px-3 py-2.5">
          {[
            ["Duration", shortDuration(trip.duration)],
            ["Grades", trip.grades.replace("Grades ", "")],
            ["Departs", trip.season.replace("December", "Dec")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.68rem] font-semibold text-mute">{label}</dt>
              <dd className="text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-sm text-mute">{trip.summary}</p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Places covered">
          {trip.places.slice(0, PREVIEW_PLACES).map((place) => (
            <li key={place} className="flex items-center gap-1 rounded-full border border-rule px-2.5 py-1 text-xs font-semibold">
              <PinIcon className="size-3.5 text-mute" />
              {place}
            </li>
          ))}
          {morePlaces > 0 && <li className="px-1 py-1 text-xs font-semibold text-mute">+{morePlaces} more</li>}
        </ul>

        <button
          type="button"
          onClick={onShowDetails}
          className="justify-self-start rounded-md text-sm font-bold text-primary hover:text-primary-hover hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View itinerary &amp; places →
        </button>
      </div>

      <div className="pass-stub grid content-center justify-items-center gap-1 px-2 py-4 text-center">
        <small className="text-[0.68rem] font-semibold text-mute">From</small>
        <b className="text-base leading-tight">{formatInr(trip.price_from_inr)}</b>
        <small className="text-[0.65rem] text-mute">per student</small>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`mt-2 rounded-[10px] px-3.5 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            selected ? "bg-primary text-white" : "border border-rule-strong bg-paper hover:border-primary hover:text-primary"
          }`}
        >
          {selected ? "Selected ✓" : "Select"}
        </button>
      </div>
    </article>
  );
}
