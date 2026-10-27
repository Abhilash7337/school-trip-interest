import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid flex-1 place-items-center px-4 py-24">
        <div className="grid max-w-md justify-items-center gap-3 text-center">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">404</span>
          <h1 className="text-3xl font-extrabold tracking-tight">This page doesn&apos;t exist</h1>
          <p className="text-mute">The link may be old or mistyped. You can still see all the trips and register your interest.</p>
          <Link href="/" className="mt-3 rounded-[10px] bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-hover">
            Back to the trips
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
