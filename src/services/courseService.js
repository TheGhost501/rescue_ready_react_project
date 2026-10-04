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