import type { Confirmation } from "@/app/actions";
import { PlaneIcon } from "./icons";

// Barcode bar widths derived from the reference, so each pass looks unique.
function barWidths(seed: string) {
  return [...(seed + seed)].slice(0, 34).map((c, i) => ((c.charCodeAt(0) + i * 7) % 4) + 1);
}

// Shown after a successful submission: a printed boarding pass.
export function ConfirmationPass({ confirmation, onRegisterAnother }: { confirmation: Confirmation; onRegisterAnother: () => void }) {
  const c = confirmation;
  return (
    <div className="rise-in grid gap-5" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">You&apos;re checked in</h2>
        <span className="rounded-full bg-signal px-3 py-1 font-mono text-xs font-semibold">Interest registered</span>
      </div>

      <div className="grid overflow-hidden rounded-2xl bg-navy text-white sm:grid-cols-[minmax(0,1fr)_160px]">
        <div className="grid gap-4 p-5">
          <small className="font-mono text-[0.62rem] tracking-[0.14em] text-board-mute">BOARDING PASS · SCHOOL TRIP INTEREST</small>
          <div className="flex items-center gap-3 text-4xl font-extrabold tracking-tight">
            HYD <PlaneIcon className="size-6 rotate-90 text-signal" /> {c.tripCode}
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["TEACHER", c.teacherName],
              ["SCHOOL", c.schoolName],
              ["TRIP", c.tripTitle],
              ["PASSENGERS", `${c.studentCount} students`],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-board-mute">{label}</dt>
                <dd className="truncate font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-navy bg-signal p-4 text-navy sm:grid sm:content-center sm:justify-items-center sm:border-l-2 sm:border-t-0">
          <div className="flex h-12 items-stretch gap-[2px] sm:h-16" aria-hidden="true">
            {barWidths(c.reference).map((w, i) => (
              <i key={i} className="block bg-navy" style={{ width: w }} />
            ))}
          </div>
          <small className="font-mono text-xs font-semibold">{c.reference}</small>
        </div>
      </div>

      <p className="text-mute">
        Thank you. We&apos;ll email <b className="text-navy">{c.email}</b> within two working days with dates, final costs and next steps.
        Keep the reference <b className="font-mono text-navy">{c.reference}</b> in case you need to contact us.
      </p>

      <button
        type="button"
        onClick={onRegisterAnother}
        className="justify-self-start rounded-lg border-2 border-rule px-4 py-2.5 text-sm font-bold hover:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        Register interest in another trip
      </button>
    </div>
  );
}
