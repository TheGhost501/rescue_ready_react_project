import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

export async function bookCourse(courseId) {
  const { data, error } = await supabase.from('bookings').insert({ course_id: courseId }).select().single()

  if (error) throw new Error(toMessage(error))
  return data
}

export async function cancelBooking(bookingId) {
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId)

  if (error) throw new Error(toMessage(error))
}

// Row Level Security returns only the current user's bookings, so no user filter is needed.
export async function getMyBooking(courseId) {
  const { data, error } = await supabase.from('bookings').select('id').eq('course_id', courseId).maybeSingle()

  if (error?.code === '22P02') return null // the id in the URL is not a valid uuid
  if (error) throw new Error(toMessage(error))
  return data // null when the user has not booked this course
}

export async function getMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, created_at, courses(id, title, location, starts_at)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(toMessage(error))
  return data
}
