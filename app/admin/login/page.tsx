import type { Metadata } from "next";
import Link from "next/link";
import { PlaneIcon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Admin sign in · School Trips" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center bg-sky px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center gap-2 font-extrabold">
          <PlaneIcon className="size-5 rotate-90 text-navy" /> School Trips
        </Link>
        <div className="grid gap-5 rounded-2xl bg-paper p-7 shadow-[0_20px_40px_-26px_rgba(14,27,61,0.4)]">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-mute">Staff only</p>
            <h1 className="mt-1 font-serif text-3xl">Sign in to the interest report</h1>
            <p className="mt-2 text-sm text-mute">Use the admin email and password set up in Supabase. There is no public sign-up.</p>
          </div>
          <LoginForm />
        </div>
        <Link href="/" className="mt-5 inline-block text-sm text-mute underline underline-offset-4 hover:text-navy">
          ← Back to the trips page
        </Link>
      </div>
    </main>
  );
}
