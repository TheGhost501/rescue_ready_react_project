# RescueReady

A booking platform for safety and first aid training courses. Instructors publish courses with a date, venue, price and a limited number of places. Learners browse the catalog, book a place and leave a review.

Built as the exam project for the SoftUni ReactJS course.

> **Status:** in development. The application is not deployed yet.

**Live demo:** not deployed yet

## Features

**Guests**

- Browse the catalog; search by title, filter by category and by upcoming or past courses, sort by date or price
- Open a course to see its details, places left and reviews

**Learners**

- Everything a guest can do
- Book a place on a course and cancel a booking
- Write, edit and delete their own reviews
- See their bookings on one page

**Instructors**

- Everything a learner can do
- Publish courses, and edit or delete the courses they authored
- See the courses they teach and how many places are booked

## Tech stack

| Part | Technology |
|---|---|
| UI | React 19, JavaScript |
| Build tool | Vite 8 |
| Routing | React Router 8 |
| Backend | Supabase (PostgreSQL, Auth, REST API) |
| Styling | CSS Modules with shared design tokens |
| Tests | Vitest, React Testing Library |

## Getting started

### Prerequisites

- Node.js 22.22 or newer
- A Supabase project (free tier is enough)

### 1. Install

```bash
git clone https://github.com/TheGhost501/rescue_ready_react_project.git
cd rescue_ready_react_project
npm install
```

### 2. Set up the backend

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the tables, the catalog view, the triggers and the Row Level Security policies.
3. In the Authentication settings, turn off "Confirm email" for the Email provider, so that new users are logged in straight after registering.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from your Supabase project's API settings:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the publishable (anon) key only. Never put the secret (`service_role`) key in this file.

### 4. Run

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with the linter |
| `npm test` | Run the unit tests |

## Project structure

```
src/
  lib/          Supabase client
  services/     API calls, one file per collection
  contexts/     authentication context
  hooks/        useAuth, useForm, useDebounce
  guards/       route guards
  components/   layout, shared UI, course and review components
  pages/        one component per route
  utils/        validators, formatters, constants
  styles/       design tokens and global styles
supabase/
  schema.sql    database schema and security policies
```

The architecture, data model, routing and key flows are described in [`architecture.md`](architecture.md).

## Functional Guide

To be added before submission.
