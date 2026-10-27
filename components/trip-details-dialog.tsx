"use client";

import { useEffect, useRef } from "react";
import { formatInr, tripColor, type Trip } from "@/lib/trips";
import { CheckIcon, CloseIcon, PinIcon, PlaneIcon } from "./icons";

type Props = {
  trip: Trip | null;
  selected: boolean;
  onClose: () => void;
  onSelect: (tripId: string) => void;
};

// Full trip details in a native <dialog>: focus trapping, Esc to close and the
// backdrop all come from the browser.
export function TripDetailsDialog({ trip, selected, onClose, onSelect }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (trip && !dialog.open) dialog.showModal();
    if (!trip && dialog.open) dialog.close();
  }, [trip]);

  const color = trip ? tripColor(trip.code) : undefined;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="trip-dialog-title"
      className="m-auto w-[min(720px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-hidden rounded-2xl bg-paper p-0 text-ink shadow-2xl"
    >
      {trip && (
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <header
            className="relative px-5 pb-5 pt-4 text-white sm:px-7"
            style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #000))` }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close trip details"
              className="absolute right-3 top-3 rounded-lg p-2 text-white/80 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <CloseIcon />
            </button>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              {trip.season} · {trip.duration}
            </span>
            <div className="mt-3 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              HYD <PlaneIcon className="size-6 rotate-90" /> {trip.code}
            </div>
            <h2 id="trip-dialog-title" className="mt-1.5 text-2xl font-bold">
              {trip.title}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {trip.destination} · {trip.grades}
            </p>
          </header>

          <div className="grid gap-6 overflow-y-auto px-5 py-6 sm:px-7">
            <p className="text-[0.95rem] leading-relaxed text-mute">{trip.summary}</p>

            <section aria-labelledby="places-h">
              <h3 id="places-h" className="mb-2.5 text-sm font-bold">
                Places covered <span className="font-normal text-mute">({trip.places.length})</span>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {trip.places.map((place) => (
                  <li key={place} className="flex items-center gap-1.5 rounded-full border border-rule bg-mist px-3 py-1.5 text-sm font-semibold">
                    <PinIcon className="size-3.5 text-mute" />
                    {place}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="itinerary-h">
              <h3 id="itinerary-h" className="mb-3 text-sm font-bold">
                Day by day
              </h3>
              <ol className="grid">
                {trip.itinerary.map((day, i) => (
                  <li key={day.day} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3">
                    <div className="flex flex-col items-center">
                      <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">D{day.day}</span>
                      {i < trip.itinerary.length - 1 && <span className="w-0.5 flex-1 bg-rule" aria-hidden="true" />}
                    </div>
                    <div className="pb-5 pt-1.5">
                      <h4 className="font-bold">{day.title}</h4>
                      <p className="mt-0.5 text-sm text-mute">{day.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="included-h">
              <h3 id="included-h" className="mb-2.5 text-sm font-bold">
                What&apos;s included
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {trip.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-5 py-4 sm:px-7">
            <div>
              <small className="block text-xs text-mute">From, per student (indicative)</small>
              <b className="text-xl">{formatInr(trip.price_from_inr)}</b>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] border border-rule px-4 py-2.5 text-sm font-bold hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onSelect(trip.id)}
                className="rounded-[10px] bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {selected ? "Continue with this trip" : "Select this trip"}
              </button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
