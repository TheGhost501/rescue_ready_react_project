import styles from './Button.module.css'

// as: what to render, a <button> by default. Pass as={Link} for navigation that should look like a
// button; type is only meaningful on a real button, so a link does not get it.
export default function Button({ as: Control = 'button', variant = 'primary', type = 'button', className = '', ...props }) {
  const typeProp = Control === 'button' ? { type } : {}
  return <Control {...typeProp} className={`${styles.button} ${styles[variant]} ${className}`} {...props} />
}
