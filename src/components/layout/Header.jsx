import { Link, NavLink } from 'react-router'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          RescueReady
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.list}>
            <li><NavLink to="/" end className={styles.link}>Home</NavLink></li>
            <li><NavLink to="/courses" end className={styles.link}>Courses</NavLink></li>
            <li><NavLink to="/my-bookings" className={styles.link}>My bookings</NavLink></li>
            <li><NavLink to="/my-courses" className={styles.link}>My courses</NavLink></li>
            <li><NavLink to="/courses/create" className={styles.link}>Create course</NavLink></li>
          </ul>
          <ul className={styles.list}>
            <li><NavLink to="/login" className={styles.link}>Log in</NavLink></li>
            <li><NavLink to="/register" className={styles.link}>Register</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
