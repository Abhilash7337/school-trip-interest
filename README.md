# School Trip Interest

A small app where teachers register their school's interest in an educational trip, and staff review every submission in a protected admin report.

**Live:** _added after deploy_ · **Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth) · Tailwind CSS 4 · zod · Vercel

## What it does

**Teachers (`/`, no login)**

- A departures-board header and three trips shown as boarding passes: Singapore STEM, Jaipur Heritage, London Universities.
- **View itinerary & places** opens a dialog with every place covered, a day-by-day plan, inclusions and the indicative price.
- A three-step check-in form: **Destination → Group (school, number of students) → Contact (name, email, phone)**. Each step is validated before moving on, and the last step shows a summary with quick edit links.
- After submitting, the teacher gets a boarding-pass confirmation with a reference code such as `STI-SIN-3F9A1C`.

**Admin (`/admin`, Supabase email + password login)**

- An "interest report": total students, the share of demand per trip, and **total students and schools per trip**.
- **Filter by trip** with tabs that live in the URL (`/admin?trip=jaipur-heritage`), so a filtered view can be shared or refreshed.
- A table of all submissions, newest first, including the same reference code the teacher saw.

## How security works

| Table | Anonymous visitor | Signed-in admin |
| --- | --- | --- |
| `trips` | read | read |
| `interest_submissions` | **insert only** | read |
| `admin_users` | none | read own row |

- Row Level Security is on for every table. Visitors can add a submission but can never read, change or delete one.
- Being logged in is not enough. The user must also be listed in `admin_users`, which the `is_admin()` function checks.
- Public sign-up is turned off in Supabase Auth. Admins are created by hand.
- The app only ever uses the publishable (anon) key. The service-role key is not used anywhere.
- Input is validated three times: in the browser (for quick feedback), in the Server Action with the same zod schema (the real gate), and by `CHECK` constraints in Postgres (the last line of defence).
- A hidden honeypot field filters out simple bots.
- `trip_student_totals` is a view with `security_invoker = true`, so it follows the caller's RLS. Visitors see zeros; admins see real totals.

## Run it locally

1. Clone and install:
   ```bash
   git clone https://github.com/Abhilash7337/school-trip-interest.git
   cd school-trip-interest
   npm install
   ```
2. Create a Supabase project, open **SQL Editor**, and run [`supabase/schema.sql`](supabase/schema.sql). This creates the tables, RLS policies and view, and seeds the three trips.
3. In Supabase, go to **Authentication → Sign In / Providers → Email** and turn off **Allow new users to sign up**.
4. Go to **Authentication → Users → Add user** and create an admin (email + password, auto-confirm). Then give it admin rights in the SQL editor:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
6. Start the app:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, and http://localhost:3000/admin for the report.

**Deploy:** import the repo in Vercel, add the same two environment variables, and deploy.

## Project structure

```
app/
  page.tsx               public page (Server Component, data streamed in <Suspense>)
  actions.ts             submitInterest Server Action: zod validation + insert
  admin/page.tsx         interest report (auth + admin check, totals, filter, table)
  admin/login/page.tsx   sign-in page
  admin/actions.ts       signIn / signOut Server Actions
components/
  trip-planner.tsx       client state for the whole public flow
  boarding-pass.tsx      trip card
  trip-details-dialog.tsx  itinerary dialog (native <dialog>)
  check-in-form.tsx      3-step form
  confirmation-pass.tsx  boarding-pass confirmation
lib/
  validation.ts          shared zod schema + phone normaliser
  supabase/server.ts     cookie-based Supabase client
  supabase/proxy.ts      session refresh + /admin redirect
proxy.ts                 Next 16 "proxy" (formerly middleware), runs on /admin only
supabase/schema.sql      tables, constraints, RLS, view, seed data
```

## What I'd add next

- An email confirmation to the teacher and a notification to the team (Resend or a Supabase Edge Function on insert).
- CSV export, search and pagination on the admin table. It currently loads the newest 500 rows.
- A status for each submission (new → contacted → confirmed), plus notes for the team.
- Rate limiting (Upstash or Vercel KV) and Cloudflare Turnstile instead of only a honeypot.
- Duplicate detection when the same email registers twice for the same trip.
- Admin screens to edit trips and itineraries instead of changing seed SQL.
- Tests: zod schema unit tests and a Playwright run through the check-in flow.

## AI tools used

- **Claude Code (Claude):** I used it to turn the brief into a plan and feature doc, and to prototype five design directions as an interactive mock-up. I picked the final design by mixing those: a clean "Campus" layout with light/dark mode, boarding-pass trip cards and a three-step check-in for teachers, and a report-style admin page. It also generated most of the first draft of the code, the SQL schema and this README, and helped me test the flows in a browser.
- **What I did:** I chose the product and UX direction and the security model (RLS insert-only, admin allowlist, server-side validation). I reviewed and tested every flow, including invalid inputs, the admin filter and totals, and confirming that the anon key cannot read submissions. I'm ready to walk through any file.

Trip content and prices are sample data for this demo.
