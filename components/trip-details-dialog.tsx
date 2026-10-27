"use client";

import { useEffect, useRef } from "react";
import { formatInr, type Trip } from "@/lib/trips";
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

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="trip-dialog-title"
      className="m-auto w-[min(720px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-hidden rounded-2xl bg-paper p-0 text-navy shadow-2xl"
    >
      {trip && (
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <header className="relative bg-navy px-5 pb-5 pt-4 text-white sm:px-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close trip details"
              className="absolute right-3 top-3 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-signal"
            >
              <CloseIcon />
            </button>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-signal">
              {trip.season} · {trip.duration}
            </p>
            <div className="mt-2 flex items-center gap-3 text-4xl font-extrabold tracking-tight">
              HYD <PlaneIcon className="size-6 rotate-90 text-signal" /> {trip.code}
            </div>
            <h2 id="trip-dialog-title" className="mt-2 text-2xl font-bold">
              {trip.title}
            </h2>
            <p className="mt-1 text-sm text-[#c7d2ee]">
              {trip.destination} · {trip.grades}
            </p>
          </header>

          <div className="grid gap-6 overflow-y-auto px-5 py-6 sm:px-7">
            <p className="text-[0.95rem] leading-relaxed text-mute">{trip.summary}</p>

            <section aria-labelledby="places-h">
              <h3 id="places-h" className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-mute">
                Places covered ({trip.places.length})
              </h3>
              <ul className="flex flex-wrap gap-2">
                {trip.places.map((place) => (
                  <li key={place} className="flex items-center gap-1.5 rounded-full bg-sky px-3 py-1.5 text-sm font-semibold">
                    <PinIcon className="size-3.5 text-mute" />
                    {place}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="itinerary-h">
              <h3 id="itinerary-h" className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-mute">
                Day by day
              </h3>
              <ol className="grid gap-0">
                {trip.itinerary.map((day, i) => (
                  <li key={day.day} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3">
                    <div className="flex flex-col items-center">
                      <span className="grid size-10 place-items-center rounded-full bg-navy font-mono text-xs font-semibold text-signal">
                        D{day.day}
                      </span>
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
              <h3 id="included-h" className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-mute">
                What&apos;s included
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {trip.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#12a594]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-rule px-5 py-4 sm:px-7">
            <div>
              <small className="block text-xs text-mute">From, per student (indicative)</small>
              <b className="text-xl">{formatInr(trip.price_from_inr)}</b>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border-2 border-rule px-4 py-2.5 text-sm font-bold hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onSelect(trip.id)}
                className="rounded-lg bg-signal px-4 py-2.5 text-sm font-extrabold text-navy hover:bg-[#ffd566] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
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
