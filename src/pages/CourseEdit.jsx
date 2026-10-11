import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import CourseForm from '../components/courses/CourseForm'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getCourse, updateCourse } from '../services/courseService'
import { toCoursePayload, toDateTimeLocal } from '../utils/formatters'

// Database row -> form values (all strings).
function toFormValues(course) {
  return {
    title: course.title,
    category: course.category,
    description: course.description,
    location: course.location,
    startsAt: toDateTimeLocal(course.starts_at),
    durationHours: String(course.duration_hours),
    price: String(course.price),
    capacity: String(course.capacity),
    imageUrl: course.image_url ?? '',
  }
}

export default function CourseEdit() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading', course: null, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    getCourse(courseId)
      .then((course) => {
        if (!ignore) setState({ status: course ? 'success' : 'notFound', course, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', course: null, error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [courseId, attempt])

  function retry() {
    setState({ status: 'loading', course: null, error: '' })
    setAttempt((current) => current + 1)
  }

  async function handleSubmit(values) {
    await updateCourse(courseId, toCoursePayload(values))
    navigate(`/courses/${courseId}`)
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

  const { course } = state
  // Only the author may edit. The database refuses the update as well.
  if (course.owner_id !== user.id) return <Navigate to={`/courses/${courseId}`} replace />

  return (
    <>
      <title>{`Edit ${course.title} | RescueReady`}</title>
      <h1>Edit course</h1>
      {/* The form is rendered only now, because useForm reads initialValues once, when it mounts. */}
      <CourseForm
        key={course.id}
        initialValues={toFormValues(course)}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        cancelTo={`/courses/${courseId}`}
        bookedCount={course.booked_count}
      />
    </>
  )
}
