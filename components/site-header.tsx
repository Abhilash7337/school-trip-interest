import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

// The one header used on every page, so the logo, height, borders and theme
// switch stay identical. `nav` sits next to the logo, `actions` on the right.
export function SiteHeader({ label, nav, actions }: { label?: string; nav?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4 sm:px-7">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold">
          <BrandMark />
          School Trips
          {label && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{label}</span>}
        </Link>
        {nav}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}

export function BrandMark() {
  return <span className="grid size-8 place-items-center rounded-[9px] bg-primary text-xs font-extrabold text-on-primary">ST</span>;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-rule py-6 text-center text-xs text-mute">School Trips · sample trips and indicative prices for this demo</footer>
  );
}

// Shared look for the small header buttons/links.
export const headerButtonClass =
  "inline-flex h-9 items-center rounded-[10px] border border-rule px-3.5 text-sm font-bold hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
