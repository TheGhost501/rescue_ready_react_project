import { formatDate } from '../../utils/formatters'
import Button from '../ui/Button'
import styles from './ReviewList.module.css'

// reviews: an instructor's reviews, each with the course it was written for (review.courses.title).
// ownReviewId: the user's review on the course being viewed. Only that one gets Edit and Delete.
export default function ReviewList({ reviews, ownReviewId = null, onEdit, onDelete }) {
  if (reviews.length === 0) return <p className={styles.empty}>No reviews for this instructor yet.</p>

  return (
    <ul className={styles.list}>
      {reviews.map((review) => (
        <li key={review.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.author}>{review.profiles.full_name}</span>
            <span className={styles.date}>{formatDate(review.created_at)}</span>
          </div>
          <p className={styles.course}>Course: {review.courses.title}</p>
          <p className={styles.rating}>
            <span className={styles.stars} aria-hidden="true">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
            <span className={styles.ratingText}>{review.rating} out of 5</span>
          </p>
          <p className={styles.comment}>{review.comment}</p>
          {review.id === ownReviewId && (
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onEdit}>
                Edit review
              </Button>
              <Button variant="danger" onClick={onDelete}>
                Delete review
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
