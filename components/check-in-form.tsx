"use client";

import { useEffect, useRef } from "react";
import type { Trip } from "@/lib/trips";
import { shortDuration, tripColor } from "@/lib/trips";
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
  onShowDetails: (tripId: string) => void;
};

// Three-step check-in: Destination → Group → Contact. Each step is checked in
// the browser before moving on; the Server Action re-checks everything.
export function CheckInForm({ trips, step, values, errors, pending, formMessage, onChange, onBack, onNext, onEdit, onShowDetails }: Props) {
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

  const linkButton = "font-bold text-primary underline-offset-2 hover:underline";

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
      <div className="grid gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Register your interest</h2>
          <p className="text-sm text-mute">Three quick steps. No payment needed.</p>
        </div>
        <ol className="grid grid-cols-3 gap-1.5 text-xs font-bold" aria-label="Progress">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = n < step;
            return (
              <li key={label} aria-current={n === step ? "step" : undefined} className="grid gap-1.5">
                <span className={`h-1.5 rounded-full ${n <= step ? "bg-primary" : "bg-rule"}`} aria-hidden="true" />
                <span className={n === step ? "text-ink" : done ? "text-primary" : "text-mute"}>
                  {done ? "✓ " : `${n}. `}
                  {label}
                </span>
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
            <legend className="mb-3 font-semibold">Which trip is your school interested in?</legend>
            {trips.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl border border-rule-strong transition-colors hover:border-primary has-checked:border-primary has-checked:bg-primary-soft"
              >
                <label className="grid cursor-pointer grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 py-3 pl-4">
                  <input
                    type="radio"
                    name="trip_id"
                    value={t.id}
                    checked={values.trip_id === t.id}
                    onChange={(e) => onChange("trip_id", e.target.value)}
                    data-invalid={Boolean(errors.trip_id)}
                    className="size-[18px] accent-primary"
                  />
                  <b className="font-mono text-sm" style={{ color: tripColor(t.code) }}>
                    {t.code}
                  </b>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{t.title}</span>
                    <span className="block text-xs text-mute">
                      {shortDuration(t.duration)} · {t.grades} · {t.season}
                    </span>
                  </span>
                </label>
                <button type="button" onClick={() => onShowDetails(t.id)} className={`px-4 py-3 text-sm ${linkButton}`}>
                  Details
                </button>
              </div>
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
                  <button type="button" onClick={() => changeStudents(-1)} aria-label="One fewer student" className="rounded-[10px] border border-rule-strong text-xl font-bold hover:border-primary hover:text-primary">
                    −
                  </button>
                  <input {...aria} {...bind("student_count")} type="number" inputMode="numeric" min={1} max={500} step={1} placeholder="40" className={`${inputClass} text-center font-semibold`} />
                  <button type="button" onClick={() => changeStudents(1)} aria-label="One more student" className="rounded-[10px] border border-rule-strong text-xl font-bold hover:border-primary hover:text-primary">
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
              <Field id="phone" label="Mobile number" error={errors.phone} hint="10-digit Indian mobile number.">
                {(aria) => <input {...aria} {...bind("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98490 12345" className={inputClass} />}
              </Field>
            </div>

            <div className="grid gap-1 rounded-xl border border-dashed border-rule-strong bg-mist px-4 py-3 text-sm">
              <span className="text-xs font-semibold text-mute">Your request</span>
              <p>
                <b>{trip?.title}</b> · {values.student_count} students · {values.school_name}
              </p>
              <p className="flex gap-3 text-xs">
                <button type="button" onClick={() => onEdit(1)} className={linkButton}>
                  Change trip
                </button>
                <button type="button" onClick={() => onEdit(2)} className={linkButton}>
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
          <button type="button" onClick={onBack} className="rounded-[10px] border border-rule-strong px-4 py-3 text-sm font-bold hover:border-ink">
            ← Back
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-[10px] bg-primary px-6 py-3 text-base font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {step < 3 ? "Continue →" : pending ? "Registering…" : "Register interest"}
        </button>
      </div>
    </form>
  );
}
