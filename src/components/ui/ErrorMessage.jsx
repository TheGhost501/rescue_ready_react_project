import Button from './Button'
import styles from './ErrorMessage.module.css'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className={styles.box}>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
