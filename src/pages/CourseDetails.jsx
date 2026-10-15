import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import BookingButton from '../components/courses/BookingButton'
import CourseImage from '../components/courses/CourseImage'
import ReviewForm from '../components/reviews/ReviewForm'
import ReviewList from '../components/reviews/ReviewList'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getMyBooking } from '../services/bookingService'
import { deleteCourse, getCourse } from '../services/courseService'
import { createReview, deleteReview, getInstructorReviews, updateReview } from '../services/reviewService'
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
const emptyReview = { rating: '', comment: '' }

// The reviews are the instructor's, from all their courses, so they need the course's owner id
// and are loaded once the course is in. The booking does not, so it loads alongside the course.
async function loadDetails(courseId, userId) {
  const [course, booking] = await Promise.all([getCourse(courseId), userId ? getMyBooking(courseId) : null])
  const reviews = course ? await getInstructorReviews(course.owner_id) : []
  return { course, reviews, booking }
}

// Form values (strings) -> the columns the database expects.
function toReviewPayload(values) {
  return { rating: Number(values.rating), comment: values.comment.trim() }
}

export default function CourseDetails() {
  const { courseId } = useParams()
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // booking is the current user's booking on this course ({ id }), or null when there is none.
  const [state, setState] = useState({ status: 'loading', course: null, reviews: [], booking: null, error: '' })
  const [attempt, setAttempt] = useState(0)
  const [deletion, setDeletion] = useState(deleteClosed)
  const [reviewDeletion, setReviewDeletion] = useState(deleteClosed)
  // true while the user's own review is swapped for the edit form
  const [isEditingReview, setIsEditingReview] = useState(false)
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

    loadDetails(courseId, userId)
      .then(({ course, reviews, booking }) => {
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

  // Called after a booking, a cancellation or a review change. It returns a promise, so the caller
  // can wait for the real numbers. It leaves status alone: 'loading' would swap the page for the
  // spinner and unmount the button that is waiting. An error is not caught here; the caller shows it.
  async function reload() {
    const { course, reviews, booking } = await loadDetails(courseId, userId)
    setState((current) => ({ ...current, status: course ? 'success' : 'notFound', course, reviews, booking }))
  }

  // After a review is saved or deleted. The change is already in the database, so a failed reload
  // must not look like a failed save (sending it again would be refused as a duplicate). The page
  // shows its error state with "Try again" instead.
  async function refreshAfterReview() {
    try {
      await reload()
    } catch (error) {
      setState({ status: 'error', course: null, reviews: [], booking: null, error: error.message })
    }
  }

  async function handleCreateReview(values) {
    await createReview({ course_id: courseId, ...toReviewPayload(values) })
    await refreshAfterReview()
  }

  async function handleUpdateReview(reviewId, values) {
    await updateReview(reviewId, toReviewPayload(values))
    await refreshAfterReview()
    setIsEditingReview(false)
  }

  async function handleDeleteReview(reviewId) {
    setReviewDeletion({ isOpen: true, isPending: true, error: '' })
    try {
      await deleteReview(reviewId)
    } catch (error) {
      setReviewDeletion({ isOpen: true, isPending: false, error: error.message })
      return
    }
    setReviewDeletion(deleteClosed)
    await refreshAfterReview()
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

  // The user's review of this course. Their reviews of the instructor's other courses are in the
  // list too, but they are changed from those courses' pages.
  const ownReview = user ? reviews.find((review) => review.user_id === user.id && review.course_id === course.id) : null

  // What sits above the reviews depends on who is looking. Only someone who booked the course can
  // review it, once it has started; the database refuses anyone else. A guest and the author see
  // nothing here. A user who has reviewed sees their review in the list with Edit and Delete, and
  // the form here only while editing.
  let reviewArea = null
  if (ownReview && isEditingReview) {
    reviewArea = (
      <div className={styles.reviewBox}>
        <h3 className={styles.reviewHeading}>Edit your review</h3>
        <ReviewForm
          key={`edit-${ownReview.id}`}
          initialValues={{ rating: String(ownReview.rating), comment: ownReview.comment }}
          submitLabel="Save review"
          onSubmit={(values) => handleUpdateReview(ownReview.id, values)}
          onCancel={() => setIsEditingReview(false)}
        />
      </div>
    )
  } else if (ownReview || !user || isOwner) {
    reviewArea = null
  } else if (booking && hasStarted) {
    reviewArea = (
      <div className={styles.reviewBox}>
        <h3 className={styles.reviewHeading}>Review this course</h3>
        <p className={styles.reviewHint}>Your rating counts toward {course.instructor_name}’s overall rating.</p>
        <ReviewForm key="add" initialValues={emptyReview} submitLabel="Post review" onSubmit={handleCreateReview} />
      </div>
    )
  } else if (booking) {
    reviewArea = <p className={styles.reviewNote}>You can review this course once it has started.</p>
  } else {
    reviewArea = <p className={styles.reviewNote}>Only people who booked this course can review it.</p>
  }

  // While editing, the form takes the place of the review in the list.
  const listedReviews = isEditingReview && ownReview ? reviews.filter((review) => review.id !== ownReview.id) : reviews

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
          <span>Instructor rating {formatRating(course.instructor_average_rating, course.instructor_review_count)}</span>
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
          <section className={styles.reviews}>
            <h2 className={styles.heading}>Reviews of {course.instructor_name}</h2>
            {reviewArea}
            {/* While the only review is being edited there is nothing else to list, and "No reviews"
                would be wrong. */}
            {!(isEditingReview && listedReviews.length === 0) && (
              <ReviewList
                reviews={listedReviews}
                ownReviewId={ownReview?.id ?? null}
                onEdit={() => setIsEditingReview(true)}
                onDelete={() => setReviewDeletion({ ...deleteClosed, isOpen: true })}
              />
            )}
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
      {ownReview && (
        <ConfirmDialog
          isOpen={reviewDeletion.isOpen}
          title="Delete your review?"
          confirmLabel="Delete review"
          pendingLabel="Deleting…"
          isPending={reviewDeletion.isPending}
          error={reviewDeletion.error}
          onConfirm={() => handleDeleteReview(ownReview.id)}
          onCancel={() => setReviewDeletion(deleteClosed)}
        >
          <p>Your review of “{course.title}” will be removed for good.</p>
        </ConfirmDialog>
      )}
    </>
  )
}
