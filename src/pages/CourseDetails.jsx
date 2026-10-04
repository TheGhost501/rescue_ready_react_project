import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import CourseImage from '../components/courses/CourseImage'
import ReviewList from '../components/reviews/ReviewList'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { getCourse } from '../services/courseService'
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

export default function CourseDetails() {
  const { courseId } = useParams()
  const [state, setState] = useState({ status: 'loading', course: null, reviews: [], error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    Promise.all([getCourse(courseId), getReviews(courseId)])
      .then(([course, reviews]) => {
        if (ignore) return
        setState({ status: course ? 'success' : 'notFound', course, reviews, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', course: null, reviews: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [courseId, attempt])

  function retry() {
    setState({ status: 'loading', course: null, reviews: [], error: '' })
    setAttempt((current) => current + 1)
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

  const { course, reviews } = state
  const isFull = course.places_left <= 0

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
          <p className={isFull ? styles.full : styles.places}>{formatPlacesLeft(course.places_left)}</p>
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
    </>
  )
}
