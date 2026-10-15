import { useEffect, useState } from 'react'

// Returns value once it has stopped changing for delay ms. Each change restarts the timer, and the
// cleanup cancels the previous one, so typing "first" gives one update, not five.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timerId)
  }, [value, delay])

  return debounced
}
