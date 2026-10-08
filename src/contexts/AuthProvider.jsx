import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getProfile, login, logout, register } from '../services/authService'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isSessionChecked, setIsSessionChecked] = useState(false)
  const [profile, setProfile] = useState(null)

  const user = session?.user ?? null
  const userId = user?.id ?? null

  // Mount: restore the session and start listening. Unmount: stop listening.
  useEffect(() => {
    let ignore = false

    supabase.auth.getSession().then(({ data }) => {
      if (ignore) return
      setSession(data.session)
      setIsSessionChecked(true)
    })

    // Only set state here. Calling Supabase inside this callback can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      ignore = true
      data.subscription.unsubscribe()
    }
  }, [])

  // Update: whenever the logged-in user changes, load their profile (name and role).
  useEffect(() => {
    if (!userId) return
    let ignore = false

    getProfile(userId)
      .then((loaded) => {
        if (!ignore) setProfile(loaded)
      })
      .catch(() => {
        if (!ignore) setProfile({ id: userId, full_name: '', role: null })
      })

    return () => {
      ignore = true
    }
  }, [userId])

  // A profile left over from the previous user must never be shown.
  const currentProfile = profile?.id === userId ? profile : null
  const isLoading = !isSessionChecked || (userId !== null && currentProfile === null)

  const value = useMemo(
    () => ({ user, profile: currentProfile, isLoading, login, register, logout }),
    [user, currentProfile, isLoading],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
