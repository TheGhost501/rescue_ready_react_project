import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import styles from './Header.module.css'

export default function Header() {
  const { user, profile, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutState, setLogoutState] = useState({ isPending: false, error: '' })

  // While the session is being restored nobody knows who this is, so neither set of links is shown.
  const isGuest = !isLoading && user === null
  const isLoggedIn = !isLoading && user !== null
  const isInstructor = isLoggedIn && profile.role === 'instructor'

  async function handleLogout() {
    setLogoutState({ isPending: true, error: '' })
    try {
      // Leave the page first. Logging out while still on a private page would make its guard
      // redirect to the login page instead.
      navigate('/')
      await logout()
      setLogoutState({ isPending: false, error: '' })
    } catch (error) {
      setLogoutState({ isPending: false, error: error.message })
    }
  }

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
            {isLoggedIn && (
              <li><NavLink to="/my-bookings" className={styles.link}>My bookings</NavLink></li>
            )}
            {isInstructor && (
              <>
                <li><NavLink to="/my-courses" className={styles.link}>My courses</NavLink></li>
                <li><NavLink to="/courses/create" className={styles.link}>Create course</NavLink></li>
              </>
            )}
          </ul>
          {isGuest && (
            <ul className={styles.list}>
              <li><NavLink to="/login" className={styles.link}>Log in</NavLink></li>
              <li><NavLink to="/register" className={styles.link}>Register</NavLink></li>
            </ul>
          )}
          {isLoggedIn && (
            <ul className={styles.list}>
              {profile.full_name && <li className={styles.user}>{profile.full_name}</li>}
              <li>
                <Button
                  variant="secondary"
                  className={styles.logout}
                  onClick={handleLogout}
                  disabled={logoutState.isPending}
                >
                  {logoutState.isPending ? 'Logging out…' : 'Log out'}
                </Button>
              </li>
            </ul>
          )}
        </nav>
      </div>
      {logoutState.error && (
        <p role="alert" className={styles.error}>
          Could not log out. {logoutState.error}
        </p>
      )}
    </header>
  )
}
