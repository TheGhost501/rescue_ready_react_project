-- RescueReady demo data (Supabase / Postgres)
-- Run in the Supabase SQL Editor, after schema.sql.
--
-- Before running, register these four accounts through the app's Register page.
-- The script finds them by email and stops if any is missing or has the wrong role.
--
--   Sarah Mitchell   instructor   instructor@rescueready.com
--   Tom Bradley      instructor   instructor2@rescueready.com
--   Emily Clarke     learner      learner@rescueready.com
--   Daniel Hughes    learner      learner2@rescueready.com
--
-- What it creates, dated around 16 October 2026:
--   15 courses: 5 past, 2 that started on 15 October (multi-day, "in progress"),
--   8 upcoming between November 2026 and April 2027
--   20 bookings and 9 reviews
--
-- The database refuses a course or booking whose start has passed, so this
-- script switches those two triggers off while it inserts, and back on before
-- it commits. The review trigger stays on, so every review is still checked:
-- the reviewer booked the course and the course has started.
--
-- Safe to run again: it first deletes every course of the two seed instructors,
-- with all bookings and reviews on them (including any made by other users).
-- Everything runs in one transaction; any error leaves the database unchanged.

begin;

-- ---------------------------------------------------------------------------
-- The four accounts
-- ---------------------------------------------------------------------------
create temp table seed_users (
  key text primary key,
  email text not null,
  role text not null,
  id uuid
) on commit drop;

insert into seed_users (key, email, role) values
  ('sarah', 'instructor@rescueready.com', 'instructor'),
  ('tom', 'instructor2@rescueready.com', 'instructor'),
  ('emily', 'learner@rescueready.com', 'learner'),
  ('daniel', 'learner2@rescueready.com', 'learner');

update seed_users s
set id = u.id
from auth.users u
join public.profiles p on p.id = u.id
where u.email = s.email
  and p.role = s.role;

do $$
begin
  if exists (select 1 from seed_users where id is null) then
    raise exception 'Missing or wrong-role accounts: %. Register them through the app first.',
      (select string_agg(email || ' (' || role || ')', ', ') from seed_users where id is null);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Start from a clean slate (bookings and reviews cascade)
-- ---------------------------------------------------------------------------
delete from public.courses
where owner_id in (select id from seed_users where role = 'instructor');

-- ---------------------------------------------------------------------------
-- Allow past start dates while seeding
-- ---------------------------------------------------------------------------
alter table public.courses disable trigger courses_before_write;
alter table public.bookings disable trigger bookings_before_insert;

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
insert into public.courses (
  owner_id, title, category, description, location,
  starts_at, duration_hours, price, capacity, image_url, created_at, updated_at
)
select
  u.id, v.title, v.category, v.description, v.location,
  v.starts_at::timestamptz, v.duration_hours, v.price, v.capacity,
  v.image_url || '?auto=compress&cs=tinysrgb&w=1200',
  v.created_at::timestamptz, v.created_at::timestamptz
from (values
  -- Past
  (
    'sarah', 'Emergency First Aid at Work', 'first-aid',
    'A one-day course for workplace first aiders in low-risk settings such as offices and shops. You will practise CPR and using an AED, the recovery position, choking, bleeding control, burns and shock. Successful learners receive a certificate valid for three years.',
    'Riverside Community Centre, Guildford',
    '2026-09-12 09:00 Europe/London', 6, 95.00, 12,
    'https://images.pexels.com/photos/6519905/pexels-photo-6519905.jpeg',
    '2026-08-10 10:15 Europe/London'
  ),
  (
    'sarah', 'Paediatric First Aid (Two Days)', 'paediatric-first-aid',
    'Two days of first aid for anyone who looks after babies and young children, including nursery staff, childminders and nannies. Covers infant and child CPR, choking, febrile seizures, allergic reactions, meningitis, burns and fractures. Meets the Early Years Foundation Stage requirement for paediatric first aid.',
    'Elm Grove Children''s Centre, Woking',
    '2026-09-21 09:00 Europe/London', 12, 165.00, 12,
    'https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg',
    '2026-08-17 09:40 Europe/London'
  ),
  (
    'tom', 'Pool Lifeguard Annual Refresher', 'lifeguarding',
    'A practical refresher for qualified pool lifeguards who need to keep their skills current between assessments. Most of the day is in the water: deep-water rescues, spinal injury management and casualty extraction, followed by CPR and AED scenarios on the poolside. Bring swimwear, a towel and your lifeguard qualification.',
    'Meadowbank Leisure Centre, Crawley',
    '2026-09-27 08:00 Europe/London', 6, 60.00, 10,
    'https://images.pexels.com/photos/27505000/pexels-photo-27505000.jpeg',
    '2026-08-24 18:05 Europe/London'
  ),
  (
    'tom', 'Fire Marshal Training', 'fire-safety',
    'A half-day course for staff who will take charge of an evacuation. Covers how fires start and spread, the duties of a fire marshal, checking and clearing areas, and when and how to use an extinguisher. Includes a walk-through of a real evacuation plan.',
    'Northgate Business Centre, Crawley',
    '2026-10-01 09:30 Europe/London', 4, 85.00, 16,
    'https://images.pexels.com/photos/18340568/pexels-photo-18340568.jpeg',
    '2026-09-01 11:20 Europe/London'
  ),
  (
    'sarah', 'Manual Handling Essentials', 'health-safety',
    'A short course on lifting, carrying, pushing and pulling safely at work. You will learn the TILE approach to assessing a task (task, individual, load, environment) and practise good lifting technique with everyday loads. Suitable for warehouse, retail, care and office staff.',
    'Carfax House Training Rooms, Horsham',
    '2026-10-07 13:00 Europe/London', 3, 45.00, 20,
    'https://images.pexels.com/photos/7843999/pexels-photo-7843999.jpeg',
    '2026-09-08 14:30 Europe/London'
  ),
  -- Started on 15 October, still running on 16 October
  (
    'sarah', 'First Aid at Work (Three Days)', 'first-aid',
    'The full three-day qualification for first aiders in higher-risk workplaces or larger teams. Builds on emergency first aid with head, spinal and chest injuries, poisoning, eye injuries, heart attack, stroke, diabetes and epilepsy. Assessed through practical scenarios; the certificate is valid for three years.',
    'Riverside Community Centre, Guildford',
    '2026-10-15 09:00 Europe/London', 18, 275.00, 12,
    'https://images.pexels.com/photos/10395785/pexels-photo-10395785.jpeg',
    '2026-09-14 10:00 Europe/London'
  ),
  (
    'tom', 'Pool Lifeguard Qualification (Five Days)', 'lifeguarding',
    'Five intensive days that take strong swimmers to a full pool lifeguard qualification. Covers pool supervision, rescue skills, spinal injury management, CPR, AED and first aid, with practical and theory assessments on the final day. You must be 16 or over and able to swim 50 metres in under 60 seconds.',
    'Meadowbank Leisure Centre, Crawley',
    '2026-10-15 08:00 Europe/London', 40, 350.00, 12,
    'https://images.pexels.com/photos/33425559/pexels-photo-33425559.jpeg',
    '2026-09-07 16:45 Europe/London'
  ),
  -- Upcoming
  (
    'sarah', 'Emergency Paediatric First Aid', 'paediatric-first-aid',
    'A one-day course on the most urgent emergencies involving babies and children: unresponsive casualties, CPR, choking, severe bleeding and shock. Ideal for parents, grandparents, babysitters and sports coaches, and as a top-up for early years staff.',
    'Elm Grove Children''s Centre, Woking',
    '2026-11-07 09:00 Europe/London', 6, 85.00, 12,
    'https://images.pexels.com/photos/8763109/pexels-photo-8763109.jpeg',
    '2026-10-01 09:10 Europe/London'
  ),
  (
    'tom', 'Fire Extinguisher Training', 'fire-safety',
    'A hands-on session on choosing and using the right extinguisher. Learn the difference between water, foam, CO2, dry powder and wet chemical extinguishers, then practise on a digital fire simulator. Suitable for anyone named in a workplace fire plan.',
    'Northgate Business Centre, Crawley',
    '2026-11-12 10:00 Europe/London', 3, 55.00, 15,
    'https://images.pexels.com/photos/36259607/pexels-photo-36259607.jpeg',
    '2026-10-02 13:25 Europe/London'
  ),
  (
    'sarah', 'First Aid at Work Requalification', 'first-aid',
    'A two-day course for first aiders whose First Aid at Work certificate is due to expire. Refreshes CPR, AED use and the management of injuries and illnesses, with practical assessments throughout. Please bring your current certificate.',
    'Riverside Community Centre, Guildford',
    '2026-11-23 09:00 Europe/London', 12, 195.00, 12,
    'https://images.pexels.com/photos/33317471/pexels-photo-33317471.jpeg',
    '2026-10-05 08:50 Europe/London'
  ),
  (
    'tom', 'Water Safety Awareness for Parents', 'water-safety',
    'A free two-hour talk for parents and carers. We cover why drowning is often silent, safe supervision at pools, beaches and at home, what to do if someone gets into difficulty in the water, and the basics of CPR for children.',
    'Seafront Community Hub, Brighton',
    '2026-11-28 10:00 Europe/London', 2, 0.00, 25,
    'https://images.pexels.com/photos/9951776/pexels-photo-9951776.jpeg',
    '2026-10-06 19:00 Europe/London'
  ),
  (
    'tom', 'Lifeguard Requalification Assessment', 'lifeguarding',
    'A morning assessment for pool lifeguards whose qualification is due for renewal. Candidates are assessed on a timed swim, rescue skills, spinal injury management and CPR. Sessions are limited to two candidates so each gets enough time in the water. Bring your log of ongoing training hours.',
    'Meadowbank Leisure Centre, Crawley',
    '2027-01-09 08:00 Europe/London', 4, 45.00, 2,
    'https://images.pexels.com/photos/4142803/pexels-photo-4142803.jpeg',
    '2026-10-08 17:30 Europe/London'
  ),
  (
    'sarah', 'Health and Safety in the Workplace', 'health-safety',
    'A one-day introduction to health and safety for employees and new supervisors. Covers legal duties, spotting hazards, simple risk assessments, slips and trips, display screen equipment and reporting accidents. Ends with a short multiple-choice test.',
    'Carfax House Training Rooms, Horsham',
    '2027-01-12 09:00 Europe/London', 7, 90.00, 20,
    'https://images.pexels.com/photos/8853521/pexels-photo-8853521.jpeg',
    '2026-10-09 10:40 Europe/London'
  ),
  (
    'sarah', 'Paediatric First Aid Refresher', 'paediatric-first-aid',
    'A three-hour practical refresher for people who already hold a paediatric first aid certificate. It focuses on infant and child CPR, choking and recognising serious illness, and is good practice between full courses. It does not replace the full qualification.',
    'Elm Grove Children''s Centre, Woking',
    '2027-02-06 09:00 Europe/London', 3, 45.00, 12,
    'https://images.pexels.com/photos/33029223/pexels-photo-33029223.jpeg',
    '2026-10-12 09:05 Europe/London'
  ),
  (
    'tom', 'Open Water Safety and Rescue', 'water-safety',
    'A practical day at the lake for open water swimmers, paddlers and event volunteers. Learn about cold water shock, currents and changing weather, then practise throw-bag rescues and reaching rescues from the bank. Wetsuits are provided; you must be a confident swimmer.',
    'Westwood Lake Watersports Centre, Reading',
    '2027-04-10 09:00 Europe/London', 6, 120.00, 10,
    'https://images.pexels.com/photos/33425561/pexels-photo-33425561.jpeg',
    '2026-10-13 15:15 Europe/London'
  )
) as v (owner, title, category, description, location, starts_at, duration_hours, price, capacity, image_url, created_at)
join seed_users u on u.key = v.owner;

-- ---------------------------------------------------------------------------
-- Bookings (each one made before its course started)
-- ---------------------------------------------------------------------------
insert into public.bookings (course_id, user_id, created_at)
select c.id, u.id, v.created_at::timestamptz
from (values
  ('Emergency First Aid at Work', 'emily', '2026-08-14 19:20 Europe/London'),
  ('Emergency First Aid at Work', 'daniel', '2026-08-22 08:45 Europe/London'),
  ('Emergency First Aid at Work', 'tom', '2026-09-01 12:10 Europe/London'),
  ('Paediatric First Aid (Two Days)', 'emily', '2026-08-25 21:05 Europe/London'),
  ('Paediatric First Aid (Two Days)', 'daniel', '2026-09-02 07:55 Europe/London'),
  ('Pool Lifeguard Annual Refresher', 'emily', '2026-09-03 18:30 Europe/London'),
  ('Pool Lifeguard Annual Refresher', 'sarah', '2026-09-10 13:15 Europe/London'),
  ('Fire Marshal Training', 'emily', '2026-09-12 10:00 Europe/London'),
  ('Fire Marshal Training', 'daniel', '2026-09-18 16:40 Europe/London'),
  ('Manual Handling Essentials', 'emily', '2026-09-20 20:15 Europe/London'),
  ('First Aid at Work (Three Days)', 'daniel', '2026-09-24 09:30 Europe/London'),
  ('First Aid at Work (Three Days)', 'tom', '2026-10-02 14:00 Europe/London'),
  ('Pool Lifeguard Qualification (Five Days)', 'emily', '2026-09-21 17:50 Europe/London'),
  ('Emergency Paediatric First Aid', 'emily', '2026-10-06 19:45 Europe/London'),
  ('First Aid at Work Requalification', 'tom', '2026-10-09 11:35 Europe/London'),
  ('Water Safety Awareness for Parents', 'emily', '2026-10-10 20:30 Europe/London'),
  ('Water Safety Awareness for Parents', 'daniel', '2026-10-12 08:20 Europe/London'),
  ('Lifeguard Requalification Assessment', 'emily', '2026-10-11 18:10 Europe/London'),
  ('Lifeguard Requalification Assessment', 'sarah', '2026-10-13 12:45 Europe/London'),
  ('Health and Safety in the Workplace', 'daniel', '2026-10-14 09:15 Europe/London')
) as v (course, booker, created_at)
join public.courses c
  on c.title = v.course
  and c.owner_id in (select id from seed_users where role = 'instructor')
join seed_users u on u.key = v.booker;

alter table public.courses enable trigger courses_before_write;
alter table public.bookings enable trigger bookings_before_insert;

-- ---------------------------------------------------------------------------
-- Reviews (checked by reviews_before_insert: booked, and the course has started)
-- ---------------------------------------------------------------------------
insert into public.reviews (course_id, user_id, rating, comment, created_at, updated_at)
select c.id, u.id, v.rating, v.comment, v.created_at::timestamptz, v.created_at::timestamptz
from (values
  (
    'Emergency First Aid at Work', 'emily', 5,
    'Really practical day. We spent most of it on the floor practising CPR and the recovery position, and I left feeling I could actually help someone.',
    '2026-09-13 10:30 Europe/London'
  ),
  (
    'Emergency First Aid at Work', 'daniel', 4,
    'Clear and well paced. The bleeding control and choking sections were excellent. The lunch break was a bit short, but the training itself was great.',
    '2026-09-14 19:10 Europe/London'
  ),
  (
    'Emergency First Aid at Work', 'tom', 5,
    'As a fellow trainer I picked up a few new ideas. Sarah keeps a group engaged all day and makes sure everyone gets hands-on time with the AED.',
    '2026-09-13 17:25 Europe/London'
  ),
  (
    'Paediatric First Aid (Two Days)', 'daniel', 4,
    'Thorough course that covered everything our nursery needs. Two full days is a lot, but the scenarios with the infant manikins made it stick.',
    '2026-09-23 20:05 Europe/London'
  ),
  (
    'Pool Lifeguard Annual Refresher', 'emily', 5,
    'Tom ran the in-water rescues brilliantly. Spinal management in the deep end was hard work, but I feel much more confident for my next assessment.',
    '2026-09-28 18:40 Europe/London'
  ),
  (
    'Pool Lifeguard Annual Refresher', 'sarah', 4,
    'Good refresher with plenty of pool time. I would have liked a little longer on the AED scenario at the end.',
    '2026-09-29 09:15 Europe/London'
  ),
  (
    'Fire Marshal Training', 'emily', 4,
    'Useful half day. The walk-through of a real evacuation plan was the most helpful part, and I now know exactly what my role is at work.',
    '2026-10-02 12:50 Europe/London'
  ),
  (
    'Fire Marshal Training', 'daniel', 5,
    'Clear, practical and never boring. Tom explained the fire triangle and the different extinguishers better than any training I have had before.',
    '2026-10-03 10:05 Europe/London'
  ),
  (
    'Manual Handling Essentials', 'emily', 3,
    'The content was useful, especially the TILE assessment, but the session felt rushed and we had little time to practise the lifts ourselves.',
    '2026-10-08 18:20 Europe/London'
  )
) as v (course, reviewer, rating, comment, created_at)
join public.courses c
  on c.title = v.course
  and c.owner_id in (select id from seed_users where role = 'instructor')
join seed_users u on u.key = v.reviewer;

-- ---------------------------------------------------------------------------
-- Check the counts: a mistyped title or key would drop a row silently
-- ---------------------------------------------------------------------------
do $$
declare
  v_courses integer;
  v_bookings integer;
  v_reviews integer;
begin
  select count(*) into v_courses
  from public.courses c
  where c.owner_id in (select id from seed_users where role = 'instructor');

  select count(*) into v_bookings
  from public.bookings b
  join public.courses c on c.id = b.course_id
  where c.owner_id in (select id from seed_users where role = 'instructor');

  select count(*) into v_reviews
  from public.reviews r
  join public.courses c on c.id = r.course_id
  where c.owner_id in (select id from seed_users where role = 'instructor');

  if v_courses <> 15 or v_bookings <> 20 or v_reviews <> 9 then
    raise exception 'Seed check failed: % courses, % bookings, % reviews (expected 15, 20, 9).',
      v_courses, v_bookings, v_reviews;
  end if;
end;
$$;

commit;

-- ---------------------------------------------------------------------------
-- Result: expect 15 rows, instructor ratings 4.2 (Sarah) and 4.5 (Tom)
-- ---------------------------------------------------------------------------
select
  title,
  instructor_name,
  starts_at,
  booked_count,
  places_left,
  review_count,
  instructor_average_rating,
  instructor_review_count
from public.course_catalog
where instructor_name in ('Sarah Mitchell', 'Tom Bradley')
order by starts_at;
