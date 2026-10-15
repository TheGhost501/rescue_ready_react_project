import { useRef, useState } from 'react'

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
  // true from a press on the submit button until the blur it causes
  const isPressingSubmit = useRef(false)

  const allErrors = validate(values)
  // Show an error only after the user has left that field or pressed submit.
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([name]) => touched[name]))

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  // Pressing the submit button blurs the field the user was in before the click lands. Showing that
  // field's error on that blur would push the button down, the release would miss it, and the click
  // would be lost. So that one blur shows nothing; the submit shows every error anyway.
  // pointerdown fires before the blur in every browser, also where buttons do not take focus.
  function handlePointerDown(event) {
    isPressingSubmit.current = event.target.closest('button[type="submit"]') !== null
  }

  function handleBlur(event) {
    if (isPressingSubmit.current) {
      isPressingSubmit.current = false
      return
    }
    const { name } = event.target
    setTouched((current) => ({ ...current, [name]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    isPressingSubmit.current = false
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

  return { values, errors, isSubmitting, submitError, handleChange, handleBlur, handlePointerDown, handleSubmit }
}
