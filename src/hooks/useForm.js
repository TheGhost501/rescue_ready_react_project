import { useState } from 'react'

// A radio group is a list of inputs, so focus goes to its first radio.
function focusField(form, name) {
  const control = form.elements[name]
  const target = control instanceof RadioNodeList ? control[0] : control
  target?.focus()
}

export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const allErrors = validate(values)
  // Show an error only after the user has left that field or pressed submit.
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([name]) => touched[name]))

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleBlur(event) {
    const { name } = event.target
    setTouched((current) => ({ ...current, [name]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched(Object.fromEntries(Object.keys(values).map((name) => [name, true])))

    const [firstInvalid] = Object.keys(allErrors)
    if (firstInvalid) {
      focusField(event.currentTarget, firstInvalid)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, submitError, handleChange, handleBlur, handleSubmit }
}
