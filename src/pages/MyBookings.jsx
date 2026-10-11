import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { getMyBookings } from '../services/bookingService'
import { formatDate, formatDateTime } from '../utils/formatters'
import styles from './MyBookings.module.css'

export default function MyBookings() {
  const [state, setState] = useState({ status: 'loading', bookings: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  // Read once, when the page opens, so that rendering stays pure.
  const [openedAt] = useState(() => new Date())

  useEffect(() => {
    let ignore = false

    getMyBookings()
      .then((bookings) => {
        if (!ignore) setState({ status: 'success', bookings, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', bookings: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setState({ status: 'loading', bookings: [], error: '' })
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <title>My bookings | RescueReady</title>
      <h1>My bookings</h1>
      {state.status === 'loading' && <Spinner label="Loading your bookings…" />}
      {state.status === 'error' && <ErrorMessage message={state.error} onRetry={retry} />}
      {state.status === 'success' && state.bookings.length === 0 && (
        <EmptyState message="You have not booked any courses yet." linkTo="/courses" linkLabel="Browse courses" />
      )}
      {state.status === 'success' && state.bookings.length > 0 && (
        <>
          <p className={styles.intro}>Open a course to see its details or to cancel your place.</p>
          <ul className={styles.list}>
            {state.bookings.map((booking) => {
              // Each booking arrives with its course: { id, created_at, courses: { id, title, ... } }
              const course = booking.courses
              const hasStarted = new Date(course.starts_at) <= openedAt

              return (
                <li key={booking.id} className={styles.item}>
                  <div>
                    <h2 className={styles.title}>
                      <Link to={`/courses/${course.id}`} className={styles.link}>
                        {course.title}
                      </Link>
                    </h2>
                    <ul className={styles.meta}>
                      <li>{formatDateTime(course.starts_at)}</li>
                      <li>{course.location}</li>
                    </ul>
                  </div>
                  <div className={styles.status}>
                    <span className={hasStarted ? styles.started : styles.upcoming}>
                      {hasStarted ? 'Already started' : 'Upcoming'}
                    </span>
                    <span className={styles.booked}>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}
