import type { Confirmation } from "@/app/actions";
import { CheckIcon, PlaneIcon } from "./icons";

// Barcode bar widths derived from the reference, so each pass looks unique.
function barWidths(seed: string) {
  return [...(seed + seed)].slice(0, 30).map((c, i) => ((c.charCodeAt(0) + i * 7) % 4) + 1);
}

// Shown after a successful submission: a printed boarding pass.
export function ConfirmationPass({ confirmation, onRegisterAnother }: { confirmation: Confirmation; onRegisterAnother: () => void }) {
  const c = confirmation;
  return (
    <div className="rise-in grid gap-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary">
          <CheckIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold">Interest registered</h2>
          <p className="text-sm text-mute">Here&apos;s your boarding pass.</p>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-2xl bg-ink text-white">
        <div className="grid gap-4 p-5">
          <small className="font-mono text-[0.62rem] tracking-[0.14em] text-white/60">BOARDING PASS · SCHOOL TRIP INTEREST</small>
          <div className="flex items-center gap-3 text-3xl font-extrabold tracking-tight">
            HYD <PlaneIcon className="size-6 rotate-90 text-amber" /> {c.tripCode}
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["TEACHER", c.teacherName],
              ["SCHOOL", c.schoolName],
              ["TRIP", c.tripTitle],
              ["STUDENTS", String(c.studentCount)],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-white/60">{label}</dt>
                <dd className="truncate font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-ink bg-amber px-5 py-3 text-ink">
          <div className="flex h-10 items-stretch gap-[2px]" aria-hidden="true">
            {barWidths(c.reference).map((w, i) => (
              <i key={i} className="block bg-ink" style={{ width: w }} />
            ))}
          </div>
          <small className="font-mono text-xs font-semibold">{c.reference}</small>
        </div>
      </div>

      <p className="text-sm text-mute">
        Thanks, {c.teacherName.split(" ")[0]}. We&apos;ll email <b className="text-ink">{c.email}</b> within two working days with dates, final
        costs and next steps. Keep the reference <b className="font-mono text-ink">{c.reference}</b> in case you need to contact us.
      </p>

      <button
        type="button"
        onClick={onRegisterAnother}
        className="justify-self-start rounded-[10px] border border-rule-strong px-4 py-2.5 text-sm font-bold hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Register interest in another trip
      </button>
    </div>
  );
}
