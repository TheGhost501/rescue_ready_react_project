import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'
import GuestRoute from './guards/GuestRoute'
import InstructorRoute from './guards/InstructorRoute'
import PrivateRoute from './guards/PrivateRoute'
import Catalog from './pages/Catalog'
import CourseDetails from './pages/CourseDetails'
import Home from './pages/Home'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import MyCourses from './pages/MyCourses'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

// Only instructors open these, so their code is downloaded when one is first opened, not up front.
const CourseCreate = lazy(() => import('./pages/CourseCreate'))
const CourseEdit = lazy(() => import('./pages/CourseEdit'))

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Catalog />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />

          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="my-bookings" element={<MyBookings />} />

            <Route element={<InstructorRoute />}>
              <Route path="courses/create" element={<CourseCreate />} />
              <Route path="courses/:courseId/edit" element={<CourseEdit />} />
              <Route path="my-courses" element={<MyCourses />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
