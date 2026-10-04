import { useEffect } from 'react'
import { useParams } from 'react-router'
import { getCourse } from '../services/courseService'
import { getReviews } from '../services/reviewService'


export default function CourseDetails() {
  const { courseId } = useParams()

  useEffect(() => {
    Promise.all([getCourse(courseId), getReviews(courseId)]).then(console.log).catch(console.error)
  }, [courseId])

  return (
    <>
      <h1>Course details</h1>
      <p>Course id: {courseId}</p>
    </>
  )
}
