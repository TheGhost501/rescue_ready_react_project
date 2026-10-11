import { useEffect, useId, useRef } from 'react'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

// Asks before an action that cannot be undone. children is the explanation under the title.
export default function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel,
  pendingLabel,
  isPending = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()

  // showModal() is what makes it a real modal: the page behind cannot be used, focus stays inside,
  // and closing returns focus to the button that opened it.
  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current

    dialog.showModal()
    return () => dialog.close()
  }, [isOpen])

  // Esc. The parent decides whether the dialog closes, so that it stays open while the request runs.
  function handleEscape(event) {
    event.preventDefault()
    if (!isPending) onCancel()
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} onCancel={handleEscape} onClose={onCancel}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {/* Cancel comes first, so it is the button that gets focus when the dialog opens. */}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
