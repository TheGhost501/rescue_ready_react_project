import { useParams } from 'react-router'

export default function CourseEdit() {
  const { courseId } = useParams()

  return (
    <>
      <h1>Edit course</h1>
      <p>Course id: {courseId}</p>
    </>
  )
}
