import { useNavigate } from 'react-router'
import CourseForm from '../components/courses/CourseForm'
import { createCourse } from '../services/courseService'
import { toCoursePayload } from '../utils/formatters'

// Every value is a string, because that is what the inputs hold.
const initialValues = {
  title: '',
  category: '',
  description: '',
  location: '',
  startsAt: '',
  durationHours: '',
  price: '',
  capacity: '',
  imageUrl: '',
}

export default function CourseCreate() {
  const navigate = useNavigate()

  async function handleSubmit(values) {
    const course = await createCourse(toCoursePayload(values))
    navigate(`/courses/${course.id}`)
  }

  return (
    <>
      <title>Create course | RescueReady</title>
      <h1>Create course</h1>
      <CourseForm
        initialValues={initialValues}
        submitLabel="Publish course"
        onSubmit={handleSubmit}
        cancelTo="/courses"
      />
    </>
  )
}
