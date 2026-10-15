import { Link } from 'react-router'
import {
  formatAvailability,
  formatBookedCount,
  formatCategory,
  formatDateTime,
  formatPrice,
  formatRating,
  isStarted,
} from '../../utils/formatters'
import CourseImage from './CourseImage'
import styles from './CourseCard.module.css'

// showBookedCount: for the instructor's own list, show '3 of 12 booked' in place of the places left.
export default function CourseCard({ course, showBookedCount = false }) {
  // Red only for a course that is full and can still be booked; a started course is neutral.
  const isFull = course.places_left <= 0 && !isStarted(course.starts_at)

  return (
    <article className={styles.card}>
      <CourseImage src={course.image_url} loading="lazy" className={styles.image} />
      <div className={styles.body}>
        <span className={styles.category}>{formatCategory(course.category)}</span>
        <h2 className={styles.title}>
          <Link to={`/courses/${course.id}`} className={styles.link}>
            {course.title}
          </Link>
        </h2>
        <ul className={styles.meta}>
          <li>{formatDateTime(course.starts_at)}</li>
          <li>{course.location}</li>
          {/* The rating is the instructor's, across all their courses. */}
          <li>
            Instructor {course.instructor_name} · {formatRating(course.instructor_average_rating, course.instructor_review_count)}
          </li>
        </ul>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(course.price)}</span>
          {showBookedCount ? (
            <span className={styles.places}>{formatBookedCount(course.booked_count, course.capacity)}</span>
          ) : (
            <span className={isFull ? styles.full : styles.places}>
              {formatAvailability(course.starts_at, course.places_left)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
