import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'
import Catalog from './pages/Catalog'
import CourseCreate from './pages/CourseCreate'
import CourseDetails from './pages/CourseDetails'
import CourseEdit from './pages/CourseEdit'
import Home from './pages/Home'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import MyCourses from './pages/MyCourses'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Catalog />} />
        <Route path="courses/create" element={<CourseCreate />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="courses/:courseId/edit" element={<CourseEdit />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
