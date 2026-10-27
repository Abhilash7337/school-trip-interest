"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitInterest, type Confirmation } from "@/app/actions";
import type { Trip } from "@/lib/trips";
import { INTEREST_FIELDS, STEP_FIELDS, firstErrors, interestSchema, type FieldErrors, type InterestField, type InterestValues } from "@/lib/validation";
import { BoardingPass } from "./boarding-pass";
import { CheckInForm, type Step } from "./check-in-form";
import { ConfirmationPass } from "./confirmation-pass";
import { TripDetailsDialog } from "./trip-details-dialog";

const EMPTY: InterestValues = { trip_id: "", school_name: "", student_count: "", teacher_name: "", email: "", phone: "" };

// Errors limited to the given fields, using the shared schema.
function errorsFor(values: InterestValues, fields: InterestField[]): FieldErrors {
  const result = interestSchema.safeParse(values);
  if (result.success) return {};
  const all = firstErrors(result.error);
  return Object.fromEntries(fields.filter((f) => all[f]).map((f) => [f, all[f]]));
}

function without(errors: FieldErrors, field: InterestField): FieldErrors {
  const rest = { ...errors };
  delete rest[field];
  return rest;
}

const stepOf = (field: InterestField): Step => (STEP_FIELDS[1].includes(field) ? 1 : STEP_FIELDS[2].includes(field) ? 2 : 3);

// Owns the whole public flow: pick a pass → read details → check in → confirmation.
export function TripPlanner({ trips }: { trips: Trip[] }) {
  const [values, setValues] = useState<InterestValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<Step>(1);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const checkInRef = useRef<HTMLDivElement>(null);

  const scrollToCheckIn = () => checkInRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // After a failed check, move focus to the first field that needs fixing.
  useEffect(() => {
    if (Object.keys(errors).length) {
      checkInRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus();
    }
  }, [errors]);

  function change(field: InterestField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Clear a field's error as soon as the new value is valid.
    if (errors[field] && !errorsFor(next, [field])[field]) {
      setErrors((prev) => without(prev, field));
    }
  }

  function selectTrip(tripId: string) {
    setDetailsId(null);
    setConfirmation(null);
    setValues((prev) => ({ ...prev, trip_id: tripId }));
    setErrors((prev) => without(prev, "trip_id"));
    if (step === 1) setStep(2);
    scrollToCheckIn();
  }

  function next() {
    const stepErrors = errorsFor(values, STEP_FIELDS[step]);
    setErrors(stepErrors);
    setFormMessage(null);
    if (Object.keys(stepErrors).length) return;
    if (step < 3) {
      setStep((step + 1) as Step);
      return;
    }

    const website = (document.getElementById("website") as HTMLInputElement | null)?.value ?? "";
    startTransition(async () => {
      const result = await submitInterest({ ...values, website });
      if (result.ok) {
        setConfirmation(result.confirmation);
        setValues(EMPTY);
        setErrors({});
        setStep(1);
        scrollToCheckIn();
        return;
      }
      setFormMessage(result.message ?? null);
      if (result.fieldErrors && Object.keys(result.fieldErrors).length) {
        setErrors(result.fieldErrors);
        const firstBad = INTEREST_FIELDS.find((f) => result.fieldErrors?.[f]);
        if (firstBad) setStep(stepOf(firstBad));
      }
    });
  }

  const detailsTrip = trips.find((t) => t.id === detailsId) ?? null;
  const gradeNumbers = trips.flatMap((t) => t.grades.match(/\d+/g)?.map(Number) ?? []);
  const gradeRange = gradeNumbers.length ? `${Math.min(...gradeNumbers)}–${Math.max(...gradeNumbers)}` : "";

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-start gap-10 px-4 pb-14 pt-10 sm:px-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:pt-16">
        <div className="lg:pt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
            <i className="size-1.5 rounded-full bg-primary ring-4 ring-primary/25" aria-hidden="true" />
            2027 season · registrations open
          </span>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">
            Educational trips your students will remember
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg text-mute">
            Pick a destination, check the day-by-day plan, and tell us roughly how many students might join. We reply within two working days with
            dates, costs and next steps.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {[
              [String(trips.length), "curated trips"],
              [gradeRange, "grades covered"],
              ["2 days", "to hear back"],
            ].map(([value, label]) => (
              <li key={label} className="grid">
                <b className="text-2xl tracking-tight">{value}</b>
                <span className="text-sm text-mute">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={checkInRef}
          id="register"
          className="scroll-mt-24 rounded-2xl border border-rule bg-paper p-5 shadow-[0_20px_40px_-24px_rgba(15,27,42,0.25)] sm:p-7"
        >
          {confirmation ? (
            <ConfirmationPass confirmation={confirmation} onRegisterAnother={() => setConfirmation(null)} />
          ) : (
            <CheckInForm
              trips={trips}
              step={step}
              values={values}
              errors={errors}
              pending={pending}
              formMessage={formMessage}
              onChange={change}
              onBack={() => {
                setErrors({});
                setStep((s) => Math.max(1, s - 1) as Step);
              }}
              onNext={next}
              onEdit={(s) => {
                setErrors({});
                setStep(s);
              }}
              onShowDetails={setDetailsId}
            />
          )}
        </div>
      </section>

      <section id="trips" aria-labelledby="destinations-h" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 id="destinations-h" className="text-2xl font-extrabold tracking-tight">
            Choose your destination
          </h2>
          <p className="text-sm text-mute">Selecting a pass fills in the form. Open one to see the full itinerary.</p>
        </div>
        <div className="-mx-4 grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-5 overflow-x-auto px-4 pb-4 pt-1 sm:auto-cols-[60%] lg:mx-0 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {trips.map((trip) => (
            <BoardingPass
              key={trip.id}
              trip={trip}
              selected={values.trip_id === trip.id}
              onSelect={() => selectTrip(trip.id)}
              onShowDetails={() => setDetailsId(trip.id)}
            />
          ))}
        </div>
      </section>

      <TripDetailsDialog
        trip={detailsTrip}
        selected={detailsTrip?.id === values.trip_id}
        onClose={() => setDetailsId(null)}
        onSelect={selectTrip}
      />
    </>
  );
}
