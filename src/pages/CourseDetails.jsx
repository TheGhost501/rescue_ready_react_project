import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ReviewList from '../components/reviews/ReviewList'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { getCourse } from '../services/courseService'
import { getReviews } from '../services/reviewService'

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

  return (
    <>
      <title>{`${course.title} | RescueReady`}</title>
      <h1>{course.title}</h1>
      <h2>Reviews</h2>
      <ReviewList reviews={reviews} />
    </>
  )
}
