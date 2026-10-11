import { useOptimistic, useState, useTransition } from 'react'
import { bookCourse, cancelBooking } from '../../services/bookingService'
import { formatPlacesLeft } from '../../utils/formatters'
import Button from '../ui/Button'
import styles from './BookingButton.module.css'

// booking is the user's booking on this course ({ id }) or null. onChanged reloads the real
// numbers in the parent and returns a promise.
export default function BookingButton({ courseId, booking, placesLeft, onChanged }) {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  // What is on screen. Normally the real props; while a click is being sent, the expected result.
  const [shown, setShown] = useOptimistic({ isBooked: booking !== null, placesLeft })

  function handleClick() {
    setError('')
    startTransition(async () => {
      const willBook = !shown.isBooked
      // Shown immediately. React drops it when this function finishes and goes back to the props.
      setShown({ isBooked: willBook, placesLeft: shown.placesLeft + (willBook ? -1 : 1) })

      try {
        if (willBook) await bookCourse(courseId)
        else await cancelBooking(booking.id)
        await onChanged()
      } catch (err) {
        setError(err.message)
        // The page may be out of date (somebody else took the last place), so load the real numbers.
        await onChanged().catch(() => {})
      }
    })
  }

  const isFull = shown.placesLeft <= 0 && !shown.isBooked

  return (
    <div className={styles.booking}>
      {/* When nothing is left the button itself says "Fully booked", so the line would repeat it. */}
      {!isFull && <p className={styles.places}>{formatPlacesLeft(shown.placesLeft)}</p>}
      {shown.isBooked && <p className={styles.booked}>You have a place on this course.</p>}
      <Button
        variant={shown.isBooked ? 'secondary' : 'primary'}
        className={styles.button}
        onClick={handleClick}
        disabled={isPending || isFull}
      >
        {shown.isBooked ? 'Cancel booking' : isFull ? 'Fully booked' : 'Book a place'}
      </Button>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
