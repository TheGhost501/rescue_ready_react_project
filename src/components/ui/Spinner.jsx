import styles from './Spinner.module.css'

export default function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className={styles.wrapper}>
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
