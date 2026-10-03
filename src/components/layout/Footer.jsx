import styles from './Footer.module.css'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.inner}>© {year} RescueReady. Safety and first aid training courses.</p>
    </footer>
  )
}
