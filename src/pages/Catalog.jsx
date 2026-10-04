import { useEffect, useState } from 'react'
import CourseCard from '../components/courses/CourseCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { getCourses } from '../services/courseService'
import styles from './Catalog.module.css'

export default function Catalog() {
  const [state, setState] = useState({ status: 'loading', courses: [], error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    getCourses()
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
      <title>Courses | RescueReady</title>
      <h1>Courses</h1>
      {state.status === 'loading' && <Spinner label="Loading courses…" />}
      {state.status === 'error' && <ErrorMessage message={state.error} onRetry={retry} />}
      {state.status === 'success' && state.courses.length === 0 && (
        <EmptyState message="No courses have been published yet." />
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
    </>
  )
}
