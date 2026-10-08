import styles from './FormCard.module.css'

// The centred card around a short form: page title, one-line intro, the form, and a footer line.
export default function FormCard({ title, intro, footer, children }) {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children}
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  )
}
