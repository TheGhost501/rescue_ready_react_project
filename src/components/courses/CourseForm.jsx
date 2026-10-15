import { useNavigate } from 'react-router'
import { useForm } from '../../hooks/useForm'
import { CATEGORIES, CURRENCY, MAX_PRICE } from '../../utils/constants'
import { validateCourse } from '../../utils/validators'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import Field from '../ui/Field'
import styles from './CourseForm.module.css'

// Used by the Create and Edit pages. The form does not know which one it is: it gets its starting
// values, the label of its button and what to do on submit.
// The fields are in the same order as the errors in validateCourse, so a failed submit can focus
// the first invalid one.
export default function CourseForm({ initialValues, submitLabel, onSubmit, cancelTo, bookedCount = 0 }) {
  const navigate = useNavigate()
  const form = useForm({
    initialValues,
    validate: (values) => validateCourse(values, bookedCount),
    onSubmit,
  })

  // The props every field shares. name must match a key in initialValues.
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
      <section className={styles.section}>
        <div>
          <h2 className={styles.heading}>About the course</h2>
          <p className={styles.hint}>What learners see first in the catalog.</p>
        </div>
        <div className={styles.fields}>
          <Field label="Title" className={styles.wide} {...field('title')} />
          <Field label="Category" as="select" {...field('category')}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Field>
          <Field
            label="Description"
            as="textarea"
            rows={6}
            hint="20 to 1000 characters. Say who the course is for and what it covers."
            className={styles.wide}
            {...field('description')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div>
          <h2 className={styles.heading}>When and where</h2>
          <p className={styles.hint}>The start is in your local time. Bookings close when the course starts.</p>
        </div>
        <div className={styles.fields}>
          <Field label="Venue" className={styles.wide} {...field('location')} />
          <Field label="Start date and time" type="datetime-local" {...field('startsAt')} />
          <Field
            label="Duration (hours)"
            type="number"
            inputMode="numeric"
            min="1"
            max="40"
            step="1"
            hint="A whole number from 1 to 40."
            {...field('durationHours')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div>
          <h2 className={styles.heading}>Price and places</h2>
          <p className={styles.hint}>The catalog shows how many places are left.</p>
        </div>
        <div className={styles.fields}>
          <Field
            label={`Price (${CURRENCY})`}
            type="number"
            inputMode="decimal"
            min="0"
            max={MAX_PRICE}
            step="0.01"
            hint="Enter 0 for a free course."
            {...field('price')}
          />
          <Field
            label="Places"
            type="number"
            inputMode="numeric"
            min="1"
            max="30"
            step="1"
            hint={bookedCount > 0 ? `1 to 30. Already booked: ${bookedCount}.` : '1 to 30.'}
            {...field('capacity')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div>
          <h2 className={styles.heading}>Photo</h2>
          <p className={styles.hint}>Optional. Without one the course shows a placeholder.</p>
        </div>
        <div className={styles.fields}>
          <Field
            label="Image URL (optional)"
            type="url"
            inputMode="url"
            hint="A link that starts with http:// or https://."
            className={styles.wide}
            {...field('imageUrl')}
          />
        </div>
      </section>

      <div className={styles.footer}>
        {form.submitError && <ErrorMessage message={form.submitError} />}
        <div className={styles.actions}>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Saving…' : submitLabel}
          </Button>
          <Button variant="secondary" onClick={() => navigate(cancelTo)} disabled={form.isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
