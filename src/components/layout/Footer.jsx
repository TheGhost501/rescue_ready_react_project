// src/components/layout/Footer.jsx
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.inner}>© {new Date().getFullYear()} RescueReady. Safety and first aid training courses.</p>
    </footer>
  )
}
