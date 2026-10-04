import { Link } from 'react-router'
import { formatCategory, formatDateTime, formatPlacesLeft, formatPrice, formatRating } from '../../utils/formatters'
import CourseImage from './CourseImage'
import styles from './CourseCard.module.css'

export default function CourseCard({ course }) {
  const isFull = course.places_left <= 0

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
          <li>{formatRating(course.average_rating, course.review_count)}</li>
        </ul>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(course.price)}</span>
          <span className={isFull ? styles.full : styles.places}>{formatPlacesLeft(course.places_left)}</span>
        </div>
      </div>
    </article>
  )
}
