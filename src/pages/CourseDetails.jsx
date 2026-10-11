import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import BookingButton from '../components/courses/BookingButton'
import CourseImage from '../components/courses/CourseImage'
import ReviewList from '../components/reviews/ReviewList'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getMyBooking } from '../services/bookingService'
import { deleteCourse, getCourse } from '../services/courseService'
import { getReviews } from '../services/reviewService'
import {
  formatCategory,
  formatDateTime,
  formatDuration,
  formatPlacesLeft,
  formatPrice,
  formatRating,
} from '../utils/formatters'
import styles from './CourseDetails.module.css'

const deleteClosed = { isOpen: false, isPending: false, error: '' }

export default function CourseDetails() {
  const { courseId } = useParams()
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // booking is the current user's booking on this course ({ id }), or null when there is none.
  const [state, setState] = useState({ status: 'loading', course: null, reviews: [], booking: null, error: '' })
  const [attempt, setAttempt] = useState(0)
  const [deletion, setDeletion] = useState(deleteClosed)
  // The time is read once, when the page opens. Reading the clock on every render would make the
  // render impure: the same props and state could give a different result.
  const [openedAt] = useState(() => new Date())

  // The id, not the user object: Supabase hands out a new object every time it refreshes the token.
  const userId = user?.id ?? null

  useEffect(() => {
    // Wait until we know who is looking. Loading as a guest first would show a user who has
    // already booked that they have not.
    if (isAuthLoading) return
    let ignore = false

    Promise.all([getCourse(courseId), getReviews(courseId), userId ? getMyBooking(courseId) : null])
      .then(([course, reviews, booking]) => {
        if (ignore) return
        setState({ status: course ? 'success' : 'notFound', course, reviews, booking, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', course: null, reviews: [], booking: null, error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [courseId, userId, isAuthLoading, attempt])

  function retry() {
    setState({ status: 'loading', course: null, reviews: [], booking: null, error: '' })
    setAttempt((current) => current + 1)
  }

  // Called after a booking or a cancellation. It returns a promise, so the caller can wait for the
  // real numbers. It leaves status alone: 'loading' would swap the page for the spinner and unmount
  // the button that is waiting. An error is not caught here; the caller shows it.
  async function reload() {
    const [course, booking] = await Promise.all([getCourse(courseId), userId ? getMyBooking(courseId) : null])
    setState((current) => ({ ...current, status: course ? 'success' : 'notFound', course, booking }))
  }

  async function handleDelete() {
    setDeletion({ isOpen: true, isPending: true, error: '' })
    try {
      await deleteCourse(courseId)
      navigate('/courses')
    } catch (error) {
      // The dialog stays open and shows the reason next to its buttons.
      setDeletion({ isOpen: true, isPending: false, error: error.message })
    }
  }

  if (state.status === 'loading') return <Spinner label="Loading course…" />
  if (state.status === 'error') return <ErrorMessage message={state.error} onRetry={retry} />
  if (state.status === 'notFound') {
    return (
      <>
        <title>Course not found | RescueReady</title>
        <h1>Course not found</h1>
        <EmptyState message="This course does not exist or has been removed." linkTo="/courses" linkLabel="Back to courses" />
      </>
    )
  }

  const { course, reviews, booking } = state
  const isFull = course.places_left <= 0
  // Only the author sees Edit and Delete. The database refuses both for everyone else as well.
  const isOwner = user?.id === course.owner_id
  // The same moment the database stops taking bookings.
  const hasStarted = new Date(course.starts_at) <= openedAt
  const placesLine = <p className={isFull ? styles.full : styles.places}>{formatPlacesLeft(course.places_left)}</p>

  // What sits under the price depends on who is looking.
  let bookingArea
  if (hasStarted) {
    bookingArea = (
      <>
        <p className={styles.places}>This course has already started.</p>
        {booking && <p className={styles.booked}>You booked a place on this course.</p>}
      </>
    )
  } else if (isOwner) {
    bookingArea = placesLine
  } else if (!user) {
    bookingArea = (
      <>
        {placesLine}
        {/* state carries this page, so the guest comes back here after logging in. */}
        <Link to="/login" state={{ from: location }} className={styles.login}>
          Log in to book
        </Link>
      </>
    )
  } else {
    bookingArea = (
      <BookingButton courseId={course.id} booking={booking} placesLeft={course.places_left} onChanged={reload} />
    )
  }

  return (
    <>
      <title>{`${course.title} | RescueReady`}</title>
      <Link to="/courses" className={styles.back}>
        <span aria-hidden="true">←</span>
        <span className={styles.backLabel}>All courses</span>
      </Link>
      <header className={styles.header}>
        <span className={styles.category}>{formatCategory(course.category)}</span>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.byline}>
          <span>Taught by {course.instructor_name}</span>
          <span>{formatRating(course.average_rating, course.review_count)}</span>
        </p>
      </header>
      <div className={styles.layout}>
        <CourseImage key={course.image_url} src={course.image_url} className={styles.image} />
        <aside className={styles.facts} aria-label="Booking information">
          <p className={styles.price}>{formatPrice(course.price)}</p>
          {bookingArea}
          <dl className={styles.list}>
            <div>
              <dt>Starts</dt>
              <dd>{formatDateTime(course.starts_at)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{formatDuration(course.duration_hours)}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{course.location}</dd>
            </div>
            <div>
              <dt>Group size</dt>
              <dd>{course.capacity === 1 ? '1 person' : `Up to ${course.capacity} people`}</dd>
            </div>
          </dl>
          {isOwner && (
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => navigate(`/courses/${course.id}/edit`)}>
                Edit course
              </Button>
              <Button variant="danger" onClick={() => setDeletion({ ...deleteClosed, isOpen: true })}>
                Delete course
              </Button>
            </div>
          )}
        </aside>
        <div className={styles.main}>
          <section>
            <h2 className={styles.heading}>About this course</h2>
            <p className={styles.description}>{course.description}</p>
          </section>
          <section>
            <h2 className={styles.heading}>Reviews</h2>
            <ReviewList reviews={reviews} />
          </section>
        </div>
      </div>
      {isOwner && (
        <ConfirmDialog
          isOpen={deletion.isOpen}
          title="Delete this course?"
          confirmLabel="Delete course"
          pendingLabel="Deleting…"
          isPending={deletion.isPending}
          error={deletion.error}
          onConfirm={handleDelete}
          onCancel={() => setDeletion(deleteClosed)}
        >
          <p>
            “{course.title}” will be removed for good, together with its bookings and reviews.
          </p>
        </ConfirmDialog>
      )}
    </>
  )
}
