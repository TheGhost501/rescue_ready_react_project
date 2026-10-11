import { CATEGORIES, LOCALE, MAX_PRICE, ROLES } from './constants'

// Each validator returns { fieldName: 'message' } for the fields that are wrong, in the order
// the fields appear in the form. An empty object means the form is valid.

function emailError(email) {
  if (!email.trim()) return 'Enter your email.'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

export function validateLogin(values) {
  const errors = {}

  const email = emailError(values.email)
  if (email) errors.email = email

  if (!values.password) errors.password = 'Enter your password.'

  return errors
}

export function validateRegister(values) {
  const errors = {}

  const fullName = values.fullName.trim()
  if (!fullName) errors.fullName = 'Enter your full name.'
  else if (fullName.length < 2 || fullName.length > 50) errors.fullName = 'Use 2 to 50 characters.'

  if (!ROLES.some((role) => role.value === values.role)) errors.role = 'Choose an account type.'

  const email = emailError(values.email)
  if (email) errors.email = email

  if (!values.password) errors.password = 'Enter a password.'
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters.'
  else if (!/[a-z]/i.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Include at least one letter and one digit.'
  }

  if (!values.repeatPassword) errors.repeatPassword = 'Repeat your password.'
  else if (values.repeatPassword !== values.password) errors.repeatPassword = 'The passwords do not match.'

  return errors
}

// bookedCount is the number of places already taken. It is 0 for a new course.
export function validateCourse(values, bookedCount = 0) {
  const errors = {}

  const title = values.title.trim()
  if (!title) errors.title = 'Enter a title.'
  else if (title.length < 5 || title.length > 80) errors.title = 'Use 5 to 80 characters.'

  if (!CATEGORIES.some((category) => category.value === values.category)) errors.category = 'Choose a category.'

  const description = values.description.trim()
  if (!description) errors.description = 'Enter a description.'
  else if (description.length < 20 || description.length > 1000) errors.description = 'Use 20 to 1000 characters.'

  const location = values.location.trim()
  if (!location) errors.location = 'Enter the venue.'
  else if (location.length < 3 || location.length > 100) errors.location = 'Use 3 to 100 characters.'

  if (!values.startsAt) errors.startsAt = 'Choose a start date and time.'
  else if (new Date(values.startsAt) <= new Date()) errors.startsAt = 'The start must be in the future.'

  const durationHours = Number(values.durationHours)
  if (values.durationHours === '') errors.durationHours = 'Enter the duration in hours.'
  else if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 40) {
    errors.durationHours = 'Enter a whole number from 1 to 40.'
  }

  // Checked as text: 19.99 * 100 is not a whole number in JavaScript, so maths cannot count decimals.
  if (values.price === '') errors.price = 'Enter a price. Use 0 for a free course.'
  else if (!/^\d+(\.\d{1,2})?$/.test(values.price)) errors.price = 'Enter 0 or more, with at most two decimal places.'
  else if (Number(values.price) > MAX_PRICE) errors.price = `Enter no more than ${MAX_PRICE.toLocaleString(LOCALE)}.`

  const capacity = Number(values.capacity)
  if (values.capacity === '') errors.capacity = 'Enter the number of places.'
  else if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) errors.capacity = 'Enter a whole number from 1 to 30.'
  else if (capacity < bookedCount) {
    errors.capacity = bookedCount === 1 ? '1 place is already booked.' : `${bookedCount} places are already booked.`
  }

  const imageUrl = values.imageUrl.trim()
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) errors.imageUrl = 'The link must start with http:// or https://.'

  return errors
}
