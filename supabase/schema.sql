-- School Trip Interest: full database setup.
-- Run once in the Supabase SQL editor (safe to re-run: it drops and recreates the objects).

drop view if exists public.trip_student_totals;
drop table if exists public.interest_submissions;
drop table if exists public.admin_users;
drop table if exists public.trips;
drop function if exists public.is_admin();

-- ---------------------------------------------------------------------------
-- Trips (public catalogue). Stored in the DB so the form, the details dialog
-- and the admin report all read one source, and submissions can FK to it.
-- ---------------------------------------------------------------------------
create table public.trips (
  id              text primary key,             -- slug, e.g. 'singapore-stem'
  code            text not null,                -- airport-style code shown on passes
  title           text not null,
  destination     text not null,
  summary         text not null,
  duration        text not null,
  grades          text not null,
  season          text not null,
  price_from_inr  integer not null check (price_from_inr > 0),
  places          text[] not null default '{}',
  itinerary       jsonb not null default '[]',  -- [{ "day": 1, "title": "...", "detail": "..." }]
  inclusions      text[] not null default '{}',
  sort_order      integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Interest submissions. CHECK constraints repeat the app's validation so bad
-- data can't get in even if someone calls the API directly with the anon key.
-- ---------------------------------------------------------------------------
create table public.interest_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  teacher_name  text not null check (char_length(teacher_name) between 2 and 100),
  school_name   text not null check (char_length(school_name) between 2 and 150),
  email         text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  phone         text not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  trip_id       text not null references public.trips (id),
  student_count integer not null check (student_count between 1 and 500)
);

create index interest_submissions_trip_created_idx
  on public.interest_submissions (trip_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Admin allowlist. Being logged in is not enough: the user's id must be here.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--   trips                 : everyone can read
--   interest_submissions  : everyone can INSERT, only admins can SELECT
--                           (no UPDATE/DELETE policy = nobody can, via the API)
--   admin_users           : a signed-in user can see only their own row
-- ---------------------------------------------------------------------------
alter table public.trips enable row level security;
alter table public.interest_submissions enable row level security;
alter table public.admin_users enable row level security;

create policy "Anyone can read trips"
  on public.trips for select
  to anon, authenticated
  using (true);

create policy "Anyone can register interest"
  on public.interest_submissions for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read submissions"
  on public.interest_submissions for select
  to authenticated
  using (public.is_admin());

create policy "Users can read their own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Totals per trip. security_invoker makes the view obey the caller's RLS, so
-- anonymous visitors see zeros and only admins see real numbers.
-- ---------------------------------------------------------------------------
create view public.trip_student_totals
with (security_invoker = true) as
select
  t.id                                   as trip_id,
  t.title,
  t.code,
  t.sort_order,
  count(s.id)::int                       as submission_count,
  coalesce(sum(s.student_count), 0)::int as total_students
from public.trips t
left join public.interest_submissions s on s.trip_id = t.id
group by t.id;

-- ---------------------------------------------------------------------------
-- Seed: three sample trips (indicative prices and itineraries).
-- ---------------------------------------------------------------------------
insert into public.trips
  (id, code, title, destination, summary, duration, grades, season, price_from_inr, places, itinerary, inclusions, sort_order)
values
(
  'singapore-stem', 'SIN', 'Singapore STEM Discovery', 'Singapore',
  'Six days of hands-on science: robotics workshops, the Science Centre, sustainable engineering at Marina Barrage and the biodomes of Gardens by the Bay.',
  '6 days · 5 nights', 'Grades 8–12', 'May 2027', 145000,
  array['Science Centre Singapore','Gardens by the Bay','Marina Barrage','University innovation lab','ArtScience Museum','NEWater Visitor Centre','S.E.A. Aquarium, Sentosa'],
  '[
    {"day":1,"title":"Arrive in Singapore","detail":"Fly from Hyderabad, check in, and take an evening walk around Marina Bay with the Spectra light-and-water show."},
    {"day":2,"title":"Science Centre Singapore","detail":"Guided galleries on energy, the human body and climate, plus an Omni-Theatre screening."},
    {"day":3,"title":"Gardens by the Bay and Marina Barrage","detail":"Cloud Forest and Flower Dome biodomes, then a sustainability tour of the barrage that keeps the city from flooding."},
    {"day":4,"title":"University innovation lab","detail":"A half-day robotics and coding workshop led by university staff, followed by the ArtScience Museum."},
    {"day":5,"title":"Water and marine science","detail":"How Singapore recycles water at the NEWater Visitor Centre, then the S.E.A. Aquarium on Sentosa."},
    {"day":6,"title":"Reflection and return","detail":"Morning reflection session where students present what they learned, then the flight home."}
  ]'::jsonb,
  array['Return flights from Hyderabad','3-star hotel, twin sharing','All meals (veg and Jain options)','Entry tickets and workshops','1 teacher escort per 10 students','Travel insurance'],
  1
),
(
  'jaipur-heritage', 'JAI', 'Jaipur Heritage Trail', 'Jaipur, Rajasthan',
  'Forts, stepwells and the stone astronomy instruments of Jantar Mantar, finished with a block-printing workshop alongside local artisans.',
  '4 days · 3 nights', 'Grades 5–10', 'December 2026', 28500,
  array['Amber Fort','Jantar Mantar','Hawa Mahal','City Palace','Panna Meena ka Kund stepwell','Albert Hall Museum','Bagru printing village'],
  '[
    {"day":1,"title":"Arrive in the Pink City","detail":"Travel from Hyderabad, see Hawa Mahal, and visit the Albert Hall Museum."},
    {"day":2,"title":"Amber Fort and the stepwell","detail":"Amber Fort at sunrise, the geometry of Panna Meena ka Kund, and a stop at Jal Mahal."},
    {"day":3,"title":"Jantar Mantar and City Palace","detail":"A guided astronomy walk through the 18th-century instruments, then City Palace. Evening of Rajasthani folk music and food."},
    {"day":4,"title":"Block printing and return","detail":"Hands-on block printing with artisans in Bagru village, then the journey home."}
  ]'::jsonb,
  array['Return travel from Hyderabad','Hotel, triple sharing','All meals','Licensed heritage guide','Entry tickets and workshop','Travel insurance'],
  2
),
(
  'london-universities', 'LHR', 'London Universities Tour', 'London, United Kingdom',
  'Campus tours and admissions talks at leading UK universities, a day in Oxford, and London''s great museums, for students planning to study abroad.',
  '8 days · 7 nights', 'Grades 10–12', 'April 2027', 290000,
  array['University College London','King''s College London','Imperial College London','University of Oxford','British Museum','Science Museum','Royal Observatory, Greenwich'],
  '[
    {"day":1,"title":"Arrive in London","detail":"Fly from Hyderabad, check in, and take an evening walk along the Thames."},
    {"day":2,"title":"UCL and the British Museum","detail":"Campus tour and admissions talk at UCL (subject to availability), then the British Museum."},
    {"day":3,"title":"King''s College and Westminster","detail":"Tour of King''s College London, then a walk past Parliament and Westminster Abbey."},
    {"day":4,"title":"Imperial College and South Kensington","detail":"Imperial College visit, followed by the Science Museum and Natural History Museum."},
    {"day":5,"title":"Oxford day trip","detail":"College visits, the Bodleian Library quadrangle and a Q&A with current students."},
    {"day":6,"title":"Greenwich","detail":"Royal Observatory and the Prime Meridian, and a river boat back into the city."},
    {"day":7,"title":"Applications workshop","detail":"A UCAS and personal-statement workshop in the morning, then a free afternoon in Covent Garden."},
    {"day":8,"title":"Return home","detail":"Check out and fly back to Hyderabad."}
  ]'::jsonb,
  array['Return flights from Hyderabad','UK visa guidance','Hotel, twin sharing','Breakfast and dinner daily','London travel card','Entry tickets and workshops','Travel insurance'],
  3
);

-- ---------------------------------------------------------------------------
-- After running this file:
--   1. Authentication → Sign In / Providers → Email: turn OFF "Allow new users to sign up".
--   2. Authentication → Users → Add user: create the admin (email + password, auto-confirm).
--   3. Give that user admin access:
--        insert into public.admin_users (user_id)
--        select id from auth.users where email = 'admin@example.com';
-- ---------------------------------------------------------------------------
