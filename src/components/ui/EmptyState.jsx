import { Link } from 'react-router'
import styles from './EmptyState.module.css'

export default function EmptyState({ message, linkTo, linkLabel }) {
  return (
    <div className={styles.box}>
      <p className={styles.message}>{message}</p>
      {linkTo && linkLabel && (
        <Link to={linkTo} className={styles.link}>
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
