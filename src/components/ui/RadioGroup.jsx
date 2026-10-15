import { useId } from 'react'
import styles from './RadioGroup.module.css'

// options: [{ value, label, hint }]
// inline: the options sit side by side and wrap, for a short scale such as a 1 to 5 rating.
export default function RadioGroup({ legend, hint, error, options, name, value, onChange, onBlur, inline = false }) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <fieldset className={styles.group} aria-describedby={describedBy}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={`${styles.options} ${inline ? styles.inline : ''}`}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.radio}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              onBlur={onBlur}
            />
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              {option.hint && <span className={styles.optionHint}>{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  )
}
