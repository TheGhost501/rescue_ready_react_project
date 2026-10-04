# React – Exam Project

## Functional Guide

## 1. Project Overview

**Application Name:** RescueReady

**Application Category / Topic:** Booking System (safety and first aid training courses)

**Main Purpose:**

RescueReady is a booking platform for in-person safety training: first aid, paediatric first aid, lifeguarding, water safety, fire safety and general health & safety. Instructors publish courses with a date, venue, price and a limited number of places. Learners browse the catalog, see how many places are left, book a place and leave a review. It replaces the usual mix of emails and spreadsheets that small training providers use to fill their courses.

## 2. User Access & Permissions

### Guest (Not Authenticated)

**Available pages / routes:**

| Route | Page |
|---|---|
| `/` | Home |
| `/courses` | Catalog |
| `/courses/:courseId` | Course details |
| `/login` | Login |
| `/register` | Register |
| `*` | Not found |

**Public data shown:** every course (title, category, description, venue, date, duration, price, instructor name, places left) and every review (rating, comment, author name). A guest cannot book, review, or create a course; the details page shows a "Log in to book" link in place of those actions.

### Authenticated User

There are two account types, chosen at registration and fixed afterwards:

- **Learner:** can book courses and review them.
- **Instructor:** can do everything a learner can, and can also publish courses.

**Main sections / pages:** everything a guest sees except Login and Register, plus:

| Route | Page | Learner | Instructor |
|---|---|---|---|
| `/my-bookings` | Courses I have booked | Yes | Yes |
| `/courses/create` | Create course | No | Yes |
| `/courses/:courseId/edit` | Edit course | No | Author only |
| `/my-courses` | Courses I teach | No | Yes |

**Details pages:** the course details page adds actions that depend on who is looking:

- A learner, or an instructor looking at someone else's course, can book a place, cancel their booking, and write, edit or delete their own review.
- The author of the course sees Edit and Delete buttons, and cannot book or review their own course.

**Create / Edit / Delete actions:**

- Only an instructor can create a course, and becomes its author.
- Only the author can edit or delete a course.
- Both rules are enforced twice: the links, buttons and routes are hidden from everyone else, and the database rejects the request through Row Level Security.
- Reviews follow the same author rule: only the author of a review can edit or delete it.

## 3. Authentication & Session Handling

### Authentication Flow

1. **App load.** `AuthProvider` mounts at the root of the app with `isLoading = true` and asks Supabase for the current session (`supabase.auth.getSession()`).
2. **Status check.** If a valid session exists, the user and their profile (name and role) are stored in the auth context; otherwise the user is `null`. Either way `isLoading` becomes `false`. Until then the route guards render a loader, so a logged-in user is never bounced to the login page during a refresh.
3. **Login or registration.** The form calls `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`. On success Supabase returns a session, the `onAuthStateChange` listener updates the context, the navigation switches to the links for that role, and the user is redirected to the page they originally tried to open, or to the catalog. Registration also creates the user's public profile (name and role) through a database trigger.
4. **Logout.** `supabase.auth.signOut()` clears the session, the listener sets the user to `null`, and the user is redirected to the home page.

### Session Persistence

- **Storage:** the Supabase client keeps the session (access token and refresh token) in `localStorage`. The current user is held in React state and shared through `AuthContext`.
- **Automatic login after refresh:** on load the session is read back from `localStorage` (step 1 above). The Supabase client refreshes the access token in the background before it expires.

## 4. Routing Structure

### Route Guards Logic

Three guard components are used as layout routes and render an `<Outlet />`:

- **`PrivateRoute`** wraps the pages that need a logged-in user. A guest is redirected to `/login`, and the page they wanted is remembered so they return to it after logging in.
- **`InstructorRoute`** is nested inside `PrivateRoute` and wraps the pages for publishing courses. A learner is redirected to `/courses`.
- **`GuestRoute`** wraps Login and Register. A logged-in user is redirected to `/courses`.

The Edit page has one more check: if the instructor is not the author of the course, they are redirected to its details page.

### Main Routes

Ten routes in total:

- **Public (3 + not found):** Home, Catalog, Course details, Not found
- **Guest only (2):** Login, Register
- **Private, any logged-in user (1):** My bookings
- **Private, instructors only (3):** Create course, Edit course, My courses

Seven of these pages are dynamic (they render data loaded from the API): Home, Catalog, Course details, Create, Edit, My courses and My bookings.

### Nested & Parameterized Routes

- **Nested routing:** yes. A root `Layout` route renders the header, footer and an `<Outlet />`. The guards are nested layout routes inside it, each with its own child routes.
- **URL parameters:** `/courses/:courseId` and `/courses/:courseId/edit`.

## 5. List → Details Flow

### Catalog / List Page

**Data displayed:** a grid of course cards. Each card shows the image, title, category, venue, start date, price, places left and average rating. A course whose start time has passed shows "Already started" in place of the places left.

**Interaction:**

- **Search** by title (text input, applied after a short pause in typing)
- **Filter** by category
- **Filter** by date: Upcoming (the default), Past or All. A course counts as past from its start time, which is also the moment it can no longer be booked.
- **Sort** by start date or price

Search, filters and sort are sent to the API as query parameters, so the database does the work and not the browser.

### Details Page

**Navigation:** each card is a `<Link>` to `/courses/:courseId`. `useNavigate` is used for redirects after an action (after create, edit, delete, login and logout).

**Route parameters:** the page reads `courseId` with `useParams` and uses it to load the course and its reviews.

## 6. Data Source & Backend

### Backend Type

Real backend: **Supabase** (Backend-as-a-Service) providing a hosted PostgreSQL database, authentication and an auto-generated REST API. The React app talks to it through the `@supabase/supabase-js` client.

Tables: `profiles`, `courses`, `bookings`, `reviews`, plus a `course_catalog` view that adds the instructor name, places left and average rating to each course. The full schema is in `supabase/schema.sql`.

Access rules live in the database (Row Level Security), not only in the UI: anyone can read courses and reviews, only an instructor can publish a course, only the author can change a course or a review, and a booking is visible only to the user who made it.

Note for reviewers: Supabase pauses free projects after a week without activity. A scheduled job pings the database to keep it awake. If the catalog fails to load on first visit, wait a minute and use the "Try again" button.

## 7. Data Operations (CRUD)

The `courses` collection implements all four operations.

### Create (POST)

An instructor opens `/courses/create` and fills in the course form. After validation the app inserts the row (`supabase.from('courses').insert(...)`), with the current user set as the author by the database. On success the user is redirected to the details page of the new course.

### Read (GET)

- **Home:** the next upcoming courses
- **Catalog:** upcoming courses by default, or past or all courses, with search, category filter and sort
- **Course details:** one course by id, with its reviews
- **My courses:** courses where the current instructor is the author
- **My bookings:** the current user's bookings with their courses

### Update (PATCH)

The author clicks Edit on the details page and lands on `/courses/:courseId/edit`. The same form component is used as for Create, pre-filled with the current values. On submit the app sends the update (`supabase.from('courses').update(...).eq('id', courseId)`).

**UI update:** the user is redirected to the details page, which loads the course again and shows the new values.

### Delete

The author clicks Delete on the details page and confirms in a dialog. The app sends the delete (`supabase.from('courses').delete().eq('id', courseId)`); the bookings and reviews of that course are removed with it.

**UI update:** the user is redirected to the catalog, which no longer contains the course.

### Interaction with existing records

- **Booking:** a logged-in user (learner or instructor) books or cancels a place from the details page. The places-left counter updates straight away. The database refuses a booking if the course is full, has already started, or belongs to the user.
- **Reviews:** a logged-in user adds a rating and comment, and can edit or delete their own review. The list and the average rating update without leaving the page.

## 8. Forms & Validation

### Forms Used

1. Register
2. Login
3. Create course
4. Edit course (same component as Create)
5. Review (add and edit)
6. Catalog search and filter

All forms use controlled inputs. Errors are shown under the field once the user leaves it and again on submit, and the submit button is disabled while the request is running.

### Validation Rules

| Field | Rules |
|---|---|
| Course title | Required, 5 to 80 characters |
| Course description | Required, 20 to 1000 characters |
| Category | Required, must be one of the listed categories |
| Venue | Required, 3 to 100 characters |
| Start date | Required, must be in the future |
| Duration | Required, whole number of hours, 1 to 40 |
| Price | Required, number, 0 or more, at most two decimal places |
| Capacity | Required, whole number, 1 to 30, and on edit not lower than the places already booked |
| Image URL | Optional, must start with `http://` or `https://` |
| Full name | Required, 2 to 50 characters |
| Account type | Required, Learner or Instructor |
| Email | Required, valid email format |
| Password | Required, at least 8 characters, with at least one letter and one digit |
| Repeat password | Required, must match the password |
| Review rating | Required, 1 to 5 |
| Review comment | Required, 10 to 500 characters |

**Field with multiple rules:** Capacity (required, whole number, range, and a rule that depends on existing bookings) and Password (required, length, composition).

The same limits are repeated as constraints in the database, so invalid data is rejected even if the client checks are bypassed.

## 9. React-Specific Techniques

### Hooks & Component Lifecycle

| Hook | Where |
|---|---|
| `useState` | Form values and errors, loading and error flags, catalog filters |
| `useEffect` | Loading data on every page, auth listener, delayed search |
| `useContext` | Reading the current user through `useAuth()` |
| `useParams`, `useNavigate`, `useLocation` | Details and Edit pages, redirects, returning after login |
| `useOptimistic`, `useTransition` | Booking button: shows the result before the server answers |
| `useMemo` | Keeps the auth context value stable between renders |
| Custom `useAuth` | Access to the auth context |
| Custom `useForm` | Values, change and blur handlers, validation and submit for every form |
| Custom `useDebounce` | Delays the catalog search until the user stops typing |

**Mount / update / unmount example (Catalog page):**

- **Mount:** the effect runs and loads the courses.
- **Update:** the effect depends on the search text, category, date filter and sort order, so it runs again when any of them changes and loads a new list.
- **Unmount:** the cleanup function cancels the pending search timer and marks the request as stale, so a response that arrives after the user has left the page is ignored.

A second example is `AuthProvider`, which subscribes to `onAuthStateChange` on mount and unsubscribes in the cleanup function.

### Context API

`AuthContext` shares the current user, their profile (name and role), the `isLoading` flag and the `login`, `register` and `logout` functions.

Consumers: the header (which links to show for a guest, a learner or an instructor), the three route guards, the Login and Register pages, the course details page (owner check, booking and review actions), and the My courses and My bookings pages.

### Component Styling

Each component has its own CSS Module (`Component.module.css`) next to it. Two global files in `src/styles` apply to the whole app: `tokens.css` holds the shared design tokens (colours, spacing, font sizes) as CSS variables, and `global.css` holds the reset and base element styles.

## 10. Typical User Flow

1. A guest opens the home page, goes to the catalog, filters by "First Aid" and opens a course to read its details and reviews.
2. They click "Log in to book", choose Register, create a learner account and are returned to the same course.
3. They book a place, see the places-left counter go down, and find the course under My bookings.
4. They come back later, leave a review on the course they attended, and log out.

An instructor's journey: register with the Instructor account type, publish a course through Create course, correct its date with Edit, and watch the places fill up under My courses. An instructor can also book a place on another instructor's course in the same way a learner does.

## 11. Error & Edge Case Handling

### Authentication errors

Wrong email or password, or an email that is already registered, is shown as a message above the form, and the values the user typed are kept. A guest who opens a private URL is sent to the login page, and a learner who opens an instructor-only URL is sent to the catalog. If the session has expired, the next protected request fails, the user is logged out and asked to log in again.

### Network or data errors

Every page that loads data has three states: a loader while waiting, the content, and an error message with a "Try again" button if the request fails. Failed actions (booking, review, save, delete) show the reason next to the button, including the messages from the database such as "This course is fully booked".

### Empty or missing data states

- Catalog with no results: "No courses match your search" with a button to clear the filters
- My bookings with nothing in it: a short message and a link to the catalog
- My courses with nothing in it: a short message and a link to Create course
- A course with no reviews: "No reviews yet"
- A course with no photo, or a photo that fails to load: a placeholder of the same size, on the card and on the details page
- A course id that does not exist: a "Course not found" message with a link back to the catalog
- An unknown URL: the Not found page
