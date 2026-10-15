import { useForm } from '../../hooks/useForm'
import { RATINGS } from '../../utils/constants'
import { validateReview } from '../../utils/validators'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import Field from '../ui/Field'
import RadioGroup from '../ui/RadioGroup'
import styles from './ReviewForm.module.css'

// Used to add a review and to edit one. Give it a different key for each, so it starts with fresh
// values. onCancel is optional: the add form has no Cancel button.
// The fields are in the same order as the errors in validateReview.
export default function ReviewForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const form = useForm({ initialValues, validate: validateReview, onSubmit })

  function field(name) {
    return {
      name,
      value: form.values[name],
      onChange: form.handleChange,
      onBlur: form.handleBlur,
      error: form.errors[name],
    }
  }

  return (
    <form className={styles.form} onSubmit={form.handleSubmit} onPointerDown={form.handlePointerDown} noValidate>
      <RadioGroup legend="Rating" options={RATINGS} inline {...field('rating')} />
      <Field label="Comment" as="textarea" rows={4} hint="10 to 500 characters." {...field('comment')} />
      {form.submitError && <ErrorMessage message={form.submitError} />}
      <div className={styles.actions}>
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={form.isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
