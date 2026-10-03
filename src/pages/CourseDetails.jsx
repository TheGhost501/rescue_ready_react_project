import { useParams } from 'react-router'

export default function CourseDetails() {
  const { courseId } = useParams()

  return (
    <>
      <h1>Course details</h1>
      <p>Course id: {courseId}</p>
    </>
  )
}
