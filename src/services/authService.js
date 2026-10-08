import { supabase } from '../lib/supabaseClient'
import { toMessage } from '../utils/errors'

// full_name and role are saved with the new user; a database trigger copies them into profiles.
export async function register({ email, password, fullName, role }) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) throw new Error(toMessage(error))
}

export async function login({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(toMessage(error))
}

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(toMessage(error))
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single()

  if (error) throw new Error(toMessage(error))
  return data
}
