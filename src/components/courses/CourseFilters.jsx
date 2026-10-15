import { CATEGORIES, SORT_OPTIONS, WHEN_OPTIONS } from '../../utils/constants'
import Field from '../ui/Field'
import styles from './CourseFilters.module.css'

// The catalog's search, filters and sort. The page holds the values; this only shows them and
// reports changes. values: { search, category, when, sort }. onChange(name, value).
export default function CourseFilters({ values, onChange }) {
  function handleChange(event) {
    onChange(event.target.name, event.target.value)
  }

  return (
    // Every change applies at once, so Enter in the search box has nothing to submit.
    <form role="search" className={styles.filters} onSubmit={(event) => event.preventDefault()}>
      <Field
        label="Search by title"
        type="search"
        name="search"
        value={values.search}
        onChange={handleChange}
        placeholder="e.g. first aid"
        autoComplete="off"
        className={styles.search}
      />
      <Field label="Category" as="select" name="category" value={values.category} onChange={handleChange}>
        <option value="">All categories</option>
        {CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </Field>
      <Field label="Dates" as="select" name="when" value={values.when} onChange={handleChange}>
        {WHEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
      <Field label="Sort by" as="select" name="sort" value={values.sort} onChange={handleChange}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
    </form>
  )
}
