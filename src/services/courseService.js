import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

// The filtering and sorting happen in the database, not in the browser.
// when: 'all', 'upcoming' or 'past'. sort: 'starts_at' or 'price'.
export async function getCourses({ search = '', category = '', when = 'all', sort = 'starts_at' } = {}) {
  let query = supabase.from('course_catalog').select('*')

  // ilike is a case-insensitive match; % means "anything".
  const term = search.trim()
  if (term) query = query.ilike('title', `%${term}%`)
  if (category) query = query.eq('category', category)

  // A course is past from its start time, the same moment the database stops taking bookings.
  const now = new Date().toISOString()
  if (when === 'upcoming') query = query.gt('starts_at', now)
  if (when === 'past') query = query.lte('starts_at', now)

  if (sort === 'price') {
    // Courses with the same price come in date order.
    query = query.order('price', { ascending: true }).order('starts_at', { ascending: true })
  } else {
    // Soonest first, except for past courses, where the most recent one is the most relevant.
    query = query.order('starts_at', { ascending: when !== 'past' })
  }

  const { data, error } = await query

  if (error) throw new Error(toMessage(error))
  return data
}

// The next courses that can still be booked, soonest first. Used by the home page.
export async function getUpcomingCourses(limit = 3) {
  const { data, error } = await supabase
    .from('course_catalog')
    .select('*')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)

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

// The courses one instructor teaches, past ones included.
export async function getMyCourses(ownerId) {
  const { data, error } = await supabase
    .from('course_catalog')
    .select('*')
    .eq('owner_id', ownerId)
    .order('starts_at', { ascending: true })

  if (error) throw new Error(toMessage(error))
  return data
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