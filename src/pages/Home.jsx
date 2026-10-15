import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import CourseCard from '../components/courses/CourseCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getUpcomingCourses } from '../services/courseService'
import styles from './Home.module.css'

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [state, setState] = useState({ status: 'loading', courses: [], error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    getUpcomingCourses(3)
      .then((courses) => {
        if (!ignore) setState({ status: 'success', courses, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', courses: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setState({ status: 'loading', courses: [], error: '' })
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <title>Home | RescueReady</title>
      <section className={styles.hero}>
        <h1 className={styles.title}>Safety and first aid training, booked in minutes</h1>
        <p className={styles.lead}>
          First aid, lifeguarding, water and fire safety courses from qualified instructors. See the places left,
          book yours, and read what past learners said about each instructor.
        </p>
        <div className={styles.actions}>
          <Button as={Link} to="/courses">
            Browse courses
          </Button>
          {/* Hidden while the session is being restored, so a logged-in user never sees it flash. */}
          {!isAuthLoading && !user && (
            <Button as={Link} to="/register" variant="secondary">
              Create an account
            </Button>
          )}
        </div>
      </section>

      <section className={styles.upcoming}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.heading}>Next courses</h2>
          <Link to="/courses" className={styles.all}>
            See all courses
          </Link>
        </div>
        {state.status === 'loading' && <Spinner label="Loading courses…" />}
        {state.status === 'error' && <ErrorMessage message={state.error} onRetry={retry} />}
        {state.status === 'success' && state.courses.length === 0 && (
          <EmptyState message="No upcoming courses right now." />
        )}
        {state.status === 'success' && state.courses.length > 0 && (
          <ul className={styles.grid}>
            {state.courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
