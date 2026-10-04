import { formatDate } from '../../utils/formatters'
import styles from './ReviewList.module.css'

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) return <p className={styles.empty}>No reviews yet.</p>

  return (
    <ul className={styles.list}>
      {reviews.map((review) => (
        <li key={review.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.author}>{review.profiles.full_name}</span>
            <span className={styles.date}>{formatDate(review.created_at)}</span>
          </div>
          <p className={styles.rating}>
            <span className={styles.stars} aria-hidden="true">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
            <span className={styles.ratingText}>{review.rating} out of 5</span>
          </p>
          <p className={styles.comment}>{review.comment}</p>
        </li>
      ))}
    </ul>
  )
}