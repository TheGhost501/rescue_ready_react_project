import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

// Always nested inside <PrivateRoute>, which has already waited for the session and the profile.
export default function InstructorRoute() {
  const { profile } = useAuth()

  if (profile?.role !== 'instructor') return <Navigate to="/courses" replace />

  return <Outlet />
}
