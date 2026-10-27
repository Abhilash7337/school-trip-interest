"use client";

import { useEffect, useRef } from "react";
import type { Trip } from "@/lib/trips";
import { shortDuration } from "@/lib/trips";
import type { FieldErrors, InterestField, InterestValues } from "@/lib/validation";
import { Field, inputClass } from "./field";

export type Step = 1 | 2 | 3;

const STEP_LABELS = ["Destination", "Group", "Contact"] as const;

type Props = {
  trips: Trip[];
  step: Step;
  values: InterestValues;
  errors: FieldErrors;
  pending: boolean;
  formMessage: string | null;
  onChange: (field: InterestField, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onEdit: (step: Step) => void;
};

// Three-step "check-in": Destination → Group → Contact. Each step is checked in
// the browser before moving on; the Server Action re-checks everything.
export function CheckInForm({ trips, step, values, errors, pending, formMessage, onChange, onBack, onNext, onEdit }: Props) {
  const stepRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Move focus into the new step so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const target = stepRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"], input:not([type="hidden"]), select');
    target?.focus();
  }, [step]);

  const trip = trips.find((t) => t.id === values.trip_id);
  const bind = (field: InterestField) => ({
    name: field,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
  });

  const changeStudents = (delta: number) => {
    const current = parseInt(values.student_count, 10) || 0;
    onChange("student_count", String(Math.min(500, Math.max(1, current + delta))));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="grid gap-6"
      aria-describedby={formMessage ? "form-message" : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">Check in your interest</h2>
        <ol className="flex gap-1.5 font-mono text-xs" aria-label="Progress">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = n < step;
            return (
              <li
                key={label}
                aria-current={n === step ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 ${n === step ? "bg-navy text-white" : done ? "bg-signal text-navy" : "bg-sky text-mute"}`}
              >
                {done ? "✓ " : `${n}. `}
                {label}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="sr-only" aria-live="polite">
        Step {step} of 3: {STEP_LABELS[step - 1]}
      </p>

      <div ref={stepRef} key={step} className="rise-in grid gap-5">
        {step === 1 && (
          <fieldset className="grid gap-2.5" aria-describedby={errors.trip_id ? "trip_id-error" : undefined}>
            <legend className="mb-3 font-bold">Which trip is your school interested in?</legend>
            {trips.map((t) => (
              <label
                key={t.id}
                className="grid cursor-pointer grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 rounded-xl border-2 border-rule px-4 py-3 transition-colors hover:border-navy has-checked:border-navy has-checked:bg-[#f4f7fd] sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]"
              >
                <input
                  type="radio"
                  name="trip_id"
                  value={t.id}
                  checked={values.trip_id === t.id}
                  onChange={(e) => onChange("trip_id", e.target.value)}
                  data-invalid={Boolean(errors.trip_id)}
                  className="size-[18px] accent-navy"
                />
                <b className="font-mono">{t.code}</b>
                <span className="font-semibold">{t.title}</span>
                <small className="hidden font-mono text-xs text-mute sm:block">
                  {shortDuration(t.duration)} · {t.grades.replace("Grades ", "Gr ")}
                </small>
              </label>
            ))}
            {errors.trip_id && (
              <p id="trip_id-error" className="text-sm font-semibold text-alert">
                {errors.trip_id}
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <>
            <Field id="school_name" label="School name" error={errors.school_name}>
              {(aria) => (
                <input {...aria} {...bind("school_name")} type="text" autoComplete="organization" placeholder="e.g. Banyan Grove Public School" className={inputClass} />
              )}
            </Field>
            <Field id="student_count" label="Number of students" error={errors.student_count} hint="An estimate is fine. Between 1 and 500.">
              {(aria) => (
                <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] gap-1.5">
                  <button type="button" onClick={() => changeStudents(-1)} aria-label="One fewer student" className="rounded-[10px] border-2 border-rule text-xl font-extrabold hover:border-navy">
                    −
                  </button>
                  <input {...aria} {...bind("student_count")} type="number" inputMode="numeric" min={1} max={500} step={1} placeholder="40" className={`${inputClass} text-center font-mono font-semibold`} />
                  <button type="button" onClick={() => changeStudents(1)} aria-label="One more student" className="rounded-[10px] border-2 border-rule text-xl font-extrabold hover:border-navy">
                    +
                  </button>
                </div>
              )}
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field id="teacher_name" label="Your name" error={errors.teacher_name}>
              {(aria) => <input {...aria} {...bind("teacher_name")} type="text" autoComplete="name" placeholder="e.g. Priya Raman" className={inputClass} />}
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="email" label="Email" error={errors.email}>
                {(aria) => <input {...aria} {...bind("email")} type="email" autoComplete="email" placeholder="name@school.edu.in" className={inputClass} />}
              </Field>
              <Field id="phone" label="Mobile number" error={errors.phone} hint="10-digit Indian mobile. We only call about this trip.">
                {(aria) => <input {...aria} {...bind("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98490 12345" className={inputClass} />}
              </Field>
            </div>

            <div className="grid gap-1 rounded-xl bg-sky px-4 py-3 text-sm">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-mute">Your request</span>
              <p>
                <b>{trip?.title}</b> · {values.student_count} students · {values.school_name}{" "}
                <button type="button" onClick={() => onEdit(1)} className="font-bold underline decoration-signal decoration-2 underline-offset-2">
                  Change trip
                </button>{" "}
                ·{" "}
                <button type="button" onClick={() => onEdit(2)} className="font-bold underline decoration-signal decoration-2 underline-offset-2">
                  Edit group
                </button>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formMessage && (
        <p id="form-message" role="alert" className="rounded-lg bg-[#fdecea] px-4 py-3 text-sm font-semibold text-alert">
          {formMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 1 && (
          <button type="button" onClick={onBack} className="rounded-[10px] border-2 border-rule px-4 py-3 text-sm font-bold hover:border-navy">
            ← Back
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-[10px] bg-signal px-6 py-3 text-base font-extrabold text-navy transition-colors hover:bg-[#ffd566] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          {step < 3 ? "Continue →" : pending ? "Registering…" : "Register interest"}
        </button>
      </div>
    </form>
  );
}
