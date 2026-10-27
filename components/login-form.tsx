"use client";

import { useState, useTransition } from "react";
import { signIn } from "@/app/admin/actions";
import { Field, inputClass } from "./field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await signIn(email, password);
          if (result.error) {
            setError(result.error);
            return;
          }
          // Full page load so the admin page is rendered with the new session cookie.
          window.location.assign("/admin");
        });
      }}
    >
      <Field id="login-email" label="Email">
        {(aria) => (
          <input {...aria} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field id="login-password" label="Password" error={error ?? undefined}>
        {(aria) => (
          <input {...aria} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        )}
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
