import { useState } from 'react'
import styles from './CourseImage.module.css'

// The course photo, or a placeholder of the same size when there is no photo or it fails to load.
export default function CourseImage({ src, className = '', ...props }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return <img src={src} alt="" className={`${styles.image} ${className}`} onError={() => setFailed(true)} {...props} />
  }

  return (
    <div className={`${styles.image} ${styles.placeholder} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={styles.mark}>
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
      </svg>
    </div>
  )
}
