import { ROLES } from './constants'

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
