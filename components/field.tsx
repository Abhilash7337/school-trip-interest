import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (aria: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
};

// Label + control + hint/error, with the aria wiring done once.
export function Field({ id, label, error, hint, children }: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-rule-strong bg-paper px-3 py-2.5 text-base text-ink placeholder:text-[#9aa5b4] transition-shadow focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20 aria-invalid:border-alert";
