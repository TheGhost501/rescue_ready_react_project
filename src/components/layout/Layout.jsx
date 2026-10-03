import { Outlet } from 'react-router'
import Footer from './Footer'
import Header from './Header'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
