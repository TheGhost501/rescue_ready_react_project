-- RescueReady database schema (Supabase / Postgres)
-- Run once in the Supabase SQL Editor on a fresh project.
--
-- Tables:   profiles, courses, bookings, reviews
-- View:     course_catalog (courses + instructor name, places left, rating)
-- Security: Row Level Security on every table. The React app talks to the
--           database directly, so these policies are the real access control.

-- ---------------------------------------------------------------------------
-- profiles: public information about a user (one row per auth.users row)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 50),
  role text not null default 'learner' check (role in ('learner', 'instructor')),
  created_at timestamptz not null default now()
);

-- Creates the profile automatically when somebody registers.
-- full_name and role come from
-- supabase.auth.signUp({ options: { data: { full_name, role } } }).
-- The role is chosen once, at registration, and cannot be changed afterwards.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Member'),
    case
      when new.raw_user_meta_data ->> 'role' = 'instructor' then 'instructor'
      else 'learner'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- courses: the main CRUD collection
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 80),
  category text not null check (
    category in (
      'first-aid',
      'paediatric-first-aid',
      'lifeguarding',
      'water-safety',
      'fire-safety',
      'health-safety'
    )
  ),
  description text not null check (char_length(description) between 20 and 1000),
  location text not null check (char_length(location) between 3 and 100),
  starts_at timestamptz not null,
  duration_hours integer not null check (duration_hours between 1 and 40),
  price numeric(7, 2) not null check (price >= 0),
  capacity integer not null check (capacity between 1 and 30),
  image_url text check (image_url is null or image_url ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_owner_id_idx on public.courses (owner_id);
create index courses_starts_at_idx on public.courses (starts_at);

-- ---------------------------------------------------------------------------
-- bookings: a user reserving one place on a course
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create index bookings_user_id_idx on public.bookings (user_id);

-- ---------------------------------------------------------------------------
-- reviews: one rating + comment per user per course
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create index reviews_user_id_idx on public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- Business rules that a CHECK constraint cannot express
-- ---------------------------------------------------------------------------

-- Courses: start date must be in the future, capacity cannot drop below the
-- places already booked, created_at is immutable, updated_at is maintained.
create function public.courses_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.starts_at <= now() then
      raise exception 'The course start date must be in the future.';
    end if;
    return new;
  end if;

  new.created_at := old.created_at;
  new.updated_at := now();

  if new.starts_at is distinct from old.starts_at and new.starts_at <= now() then
    raise exception 'The course start date must be in the future.';
  end if;

  if new.capacity < (select count(*) from public.bookings b where b.course_id = new.id) then
    raise exception 'Capacity cannot be lower than the number of places already booked.';
  end if;

  return new;
end;
$$;

create trigger courses_before_write
  before insert or update on public.courses
  for each row execute function public.courses_before_write();

-- Bookings: no booking your own course, no booking a course that has started,
-- no overbooking. The row lock makes two simultaneous bookings for the last
-- place queue up instead of both succeeding.
create function public.bookings_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses%rowtype;
begin
  select * into v_course
  from public.courses c
  where c.id = new.course_id
  for update;

  if not found then
    raise exception 'Course not found.';
  end if;

  if v_course.owner_id = new.user_id then
    raise exception 'You cannot book a place on your own course.';
  end if;

  if v_course.starts_at <= now() then
    raise exception 'This course has already started.';
  end if;

  if (select count(*) from public.bookings b where b.course_id = new.course_id) >= v_course.capacity then
    raise exception 'This course is fully booked.';
  end if;

  return new;
end;
$$;

create trigger bookings_before_insert
  before insert on public.bookings
  for each row execute function public.bookings_before_insert();

-- Reviews: a review cannot be moved to another course or another author.
create function public.reviews_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.course_id := old.course_id;
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_before_update
  before update on public.reviews
  for each row execute function public.reviews_before_update();

-- ---------------------------------------------------------------------------
-- Catalog view
-- ---------------------------------------------------------------------------

-- Bookings are private, but everybody (guests included) needs to see how many
-- places are left. This function exposes only the count, never who booked.
create function public.course_booked_count(p_course_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.bookings b where b.course_id = p_course_id;
$$;

create view public.course_catalog
with (security_invoker = true) as
select
  c.id,
  c.owner_id,
  c.title,
  c.category,
  c.description,
  c.location,
  c.starts_at,
  c.duration_hours,
  c.price,
  c.capacity,
  c.image_url,
  c.created_at,
  c.updated_at,
  p.full_name as instructor_name,
  b.booked_count,
  greatest(c.capacity - b.booked_count, 0) as places_left,
  r.review_count,
  r.average_rating
from public.courses c
join public.profiles p on p.id = c.owner_id
cross join lateral (
  select public.course_booked_count(c.id) as booked_count
) b
cross join lateral (
  select
    count(*)::integer as review_count,
    round(avg(rv.rating), 1) as average_rating
  from public.reviews rv
  where rv.course_id = c.id
) r;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- profiles: anyone can read names, a user can edit only their own
create policy "Profiles are visible to everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- courses: anyone can read, only instructors can publish,
-- only the author can change
create policy "Courses are visible to everyone"
  on public.courses for select
  to anon, authenticated
  using (true);

create policy "Instructors can create courses"
  on public.courses for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'instructor'
    )
  );

create policy "Authors can update their own courses"
  on public.courses for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Authors can delete their own courses"
  on public.courses for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- bookings: private to the user who made them
create policy "Users can see their own bookings"
  on public.bookings for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can book for themselves"
  on public.bookings for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can cancel their own bookings"
  on public.bookings for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- reviews: anyone can read, authors manage their own,
-- and an instructor cannot review their own course
create policy "Reviews are visible to everyone"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Logged-in users can review other people's courses"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and not exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Authors can update their own reviews"
  on public.reviews for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Authors can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants: stated explicitly so the API works even if the Supabase project
-- does not expose new tables automatically. RLS above still decides which rows.
-- ---------------------------------------------------------------------------
grant select on public.profiles, public.courses, public.reviews, public.course_catalog
  to anon, authenticated;

-- A user may rename themselves but never change their role: take away
-- whole-row update (Supabase grants it by default) and give back one column.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
grant insert, update, delete on public.courses to authenticated;
grant select, insert, delete on public.bookings to authenticated;
grant insert, update, delete on public.reviews to authenticated;

grant execute on function public.course_booked_count(uuid) to anon, authenticated;
