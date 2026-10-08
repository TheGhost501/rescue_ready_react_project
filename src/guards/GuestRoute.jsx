import { Navigate, Outlet, useLocation } from 'react-router'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export default function GuestRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />
  // Send a user who has just logged in back to the page they came from.
  if (user) return <Navigate to={location.state?.from?.pathname ?? '/courses'} replace />

  return <Outlet />
}
