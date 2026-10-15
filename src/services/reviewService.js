import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

// Every review on every course one instructor teaches, newest first. A review still belongs to the
// course it was written for; courses(title) says which one.
// !inner turns the embedded courses into a filter, so only that instructor's courses count.
export async function getInstructorReviews(ownerId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, course_id, rating, comment, created_at, user_id, profiles(full_name), courses!inner(title, owner_id)')
    .eq('courses.owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(toMessage(error))
  return data
}

// user_id is not sent: the database fills it in from the logged-in user. The database also refuses
// a review from someone who did not book the course, or before it has started.
export async function createReview(values) {
  const { data, error } = await supabase.from('reviews').insert(values).select().single()

  if (error) throw new Error(toMessage(error))
  return data
}

// Row Level Security hides other people's reviews from update and delete, so a blocked request
// changes zero rows and reports no error. select() returns the rows that were changed.
export async function updateReview(reviewId, values) {
  const { data, error } = await supabase.from('reviews').update(values).eq('id', reviewId).select()

  if (error) throw new Error(toMessage(error))
  if (data.length === 0) throw new Error('Review not found, or you are not its author.')
  return data[0]
}

export async function deleteReview(reviewId) {
  const { data, error } = await supabase.from('reviews').delete().eq('id', reviewId).select('id')

  if (error) throw new Error(toMessage(error))
  if (data.length === 0) throw new Error('Review not found, or you are not its author.')
}
