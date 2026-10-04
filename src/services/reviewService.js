import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

export async function getReviews(courseId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, user_id, profiles(full_name)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error?.code === '22P02') return [] // the id in the URL is not a valid uuid
  if (error) throw new Error(toMessage(error))
  return data
}
