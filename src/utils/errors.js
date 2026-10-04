export function toMessage(error) {
  if (error.code === '23505') return 'You have already done this.'
  if (/failed to fetch|networkerror|load failed/i.test(error.message)) {
    return 'Could not reach the server. Check your connection and try again.'
  }
  return error.message
}