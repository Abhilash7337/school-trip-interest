import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { SiteFooter, SiteHeader, headerButtonClass } from "@/components/site-header";

export const metadata: Metadata = { title: "Admin sign in · School Trips" };

export default function LoginPage() {
  return (
    <>
      <SiteHeader
        label="Admin"
        actions={
          <Link href="/" className={headerButtonClass}>
            Trips page
          </Link>
        }
      />
      <main className="grid flex-1 place-items-center px-4 py-16">
        <div className="grid w-full max-w-sm gap-5 rounded-2xl border border-rule bg-paper p-7 shadow-[0_20px_40px_-24px_rgba(15,27,42,0.25)]">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Staff only</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Sign in to the interest report</h1>
            <p className="mt-2 text-sm text-mute">Use the admin email and password set up in Supabase. There is no public sign-up.</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
