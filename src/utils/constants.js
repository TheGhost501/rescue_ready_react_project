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

// The values must match the role check in supabase/schema.sql.
export const ROLES = [
  { value: 'learner', label: 'Learner', hint: 'Book courses and review them.' },
  { value: 'instructor', label: 'Instructor', hint: 'Everything a learner can do, plus publishing courses.' },
]
