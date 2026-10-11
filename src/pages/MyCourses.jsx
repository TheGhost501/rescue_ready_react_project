import { useEffect, useState } from 'react'
import CourseCard from '../components/courses/CourseCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getMyCourses } from '../services/courseService'
import styles from './MyCourses.module.css'

export default function MyCourses() {
  // The route guards render this page only for a logged-in instructor, so there is always a user.
  const { user } = useAuth()
  const userId = user.id
  const [state, setState] = useState({ status: 'loading', courses: [], error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    getMyCourses(userId)
      .then((courses) => {
        if (!ignore) setState({ status: 'success', courses, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', courses: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [userId, attempt])

  function retry() {
    setState({ status: 'loading', courses: [], error: '' })
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <title>My courses | RescueReady</title>
      <h1>My courses</h1>
      {state.status === 'loading' && <Spinner label="Loading your courses…" />}
      {state.status === 'error' && <ErrorMessage message={state.error} onRetry={retry} />}
      {state.status === 'success' && state.courses.length === 0 && (
        <EmptyState message="You have not published any courses yet." linkTo="/courses/create" linkLabel="Create course" />
      )}
      {state.status === 'success' && state.courses.length > 0 && (
        <>
          <p className={styles.intro}>Open a course to edit or delete it. Each card shows how many places are booked.</p>
          <ul className={styles.grid}>
            {state.courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} showBookedCount />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
