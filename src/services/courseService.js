import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

// when: 'all', 'upcoming' or 'past'
export async function getCourses({ when = 'all' } = {}) {
  let query = supabase.from('course_catalog').select('*')

  // A course is past from its start time, the same moment the database stops taking bookings.
  const now = new Date().toISOString()
  if (when === 'upcoming') query = query.gt('starts_at', now)
  if (when === 'past') query = query.lte('starts_at', now)

  const { data, error } = await query.order('starts_at', { ascending: true })

  if (error) throw new Error(toMessage(error))
  return data
}

export async function getCourse(courseId) {
  const { data, error } = await supabase
    .from('course_catalog')
    .select('*')
    .eq('id', courseId)
    .maybeSingle()

  if (error?.code === '22P02') return null // the id in the URL is not a valid uuid
  if (error) throw new Error(toMessage(error))
  return data // null when there is no such course
}

// owner_id is not sent: the database fills it in from the logged-in user.
export async function createCourse(values) {
  const { data, error } = await supabase.from('courses').insert(values).select().single()

  if (error) throw new Error(toMessage(error))
  return data
}

// Row Level Security hides other people's courses, so a blocked update or delete changes zero rows
// and reports no error. select() returns the rows that were changed, which is how we tell.
export async function updateCourse(courseId, values) {
  const { data, error } = await supabase.from('courses').update(values).eq('id', courseId).select()

  if (error) throw new Error(toMessage(error))
  if (data.length === 0) throw new Error('Course not found, or you are not its author.')
  return data[0]
}

export async function deleteCourse(courseId) {
  const { data, error } = await supabase.from('courses').delete().eq('id', courseId).select('id')

  if (error) throw new Error(toMessage(error))
  if (data.length === 0) throw new Error('Course not found, or you are not its author.')
}