import { Navigate, Outlet, useLocation } from 'react-router'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />
  // Remember the page the guest wanted, so that login can send them back to it.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
