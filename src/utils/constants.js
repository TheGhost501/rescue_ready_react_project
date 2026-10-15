export const LOCALE = 'en-GB'
export const CURRENCY = 'GBP'

// The values must match the category check in supabase/schema.sql.
export const CATEGORIES = [
  { value: 'first-aid', label: 'First aid' },
  { value: 'paediatric-first-aid', label: 'Paediatric first aid' },
  { value: 'lifeguarding', label: 'Lifeguarding' },
  { value: 'water-safety', label: 'Water safety' },
  { value: 'fire-safety', label: 'Fire safety' },
  { value: 'health-safety', label: 'Health & safety' },
]

// Must match the price check in supabase/schema.sql.
export const MAX_PRICE = 9999.99

// The values must match the role check in supabase/schema.sql.
export const ROLES = [
  { value: 'learner', label: 'Learner', hint: 'Book courses and review them.' },
  { value: 'instructor', label: 'Instructor', hint: 'Everything a learner can do, plus publishing courses.' },
]

// The review rating options. The range must match the rating check in supabase/schema.sql.
export const RATINGS = [
  { value: '1', label: '1 ★', hint: 'Poor' },
  { value: '2', label: '2 ★', hint: 'Fair' },
  { value: '3', label: '3 ★', hint: 'Good' },
  { value: '4', label: '4 ★', hint: 'Very good' },
  { value: '5', label: '5 ★', hint: 'Excellent' },
]
