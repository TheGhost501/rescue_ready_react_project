import { supabase } from '../lib/supabaseClient';
import { toMessage } from '../utils/errors';

export async function getCourses() {
  const { data, error } = await supabase
    .from('course_catalog')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) throw new Error(toMessage(error));
  return data;
}