import { CATEGORIES, CURRENCY, LOCALE } from './constants'

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const priceFormat = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })

// 'first-aid' -> 'First aid'
export function formatCategory(value) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value
}

// Database value (UTC) -> 'Sun, 18 Oct 2026, 09:30' in the user's time zone.
export function formatDateTime(isoString) {
  return dateTimeFormat.format(new Date(isoString))
}

// Database value (UTC) -> '18 Oct 2026'
export function formatDate(isoString) {
  return dateFormat.format(new Date(isoString))
}

// 85 -> '£85.00', 0 -> 'Free'
export function formatPrice(price) {
  return Number(price) === 0 ? 'Free' : priceFormat.format(price)
}

// 6 -> '6 hours'
export function formatDuration(hours) {
  return hours === 1 ? '1 hour' : `${hours} hours`
}

// 0 -> 'Fully booked', 1 -> '1 place left'
export function formatPlacesLeft(placesLeft) {
  if (placesLeft <= 0) return 'Fully booked'
  return placesLeft === 1 ? '1 place left' : `${placesLeft} places left`
}

// From its start time a course can no longer be booked, the same rule the database uses.
export function isStarted(startsAt) {
  return new Date(startsAt) <= new Date()
}

// Started -> 'Already started', otherwise the places left.
export function formatAvailability(startsAt, placesLeft) {
  if (isStarted(startsAt)) return 'Already started'
  return formatPlacesLeft(placesLeft)
}

// (3, 12) -> '3 of 12 booked'
export function formatBookedCount(bookedCount, capacity) {
  return `${bookedCount} of ${capacity} booked`
}

// (4.5, 3) -> '4.5 (3 reviews)'. The average is null when there are no reviews.
export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return 'No reviews yet'
  return `${Number(averageRating).toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
}

// Database value (UTC) -> value for <input type="datetime-local">, which is local time with no zone.
export function toDateTimeLocal(isoString) {
  const date = new Date(isoString)
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return shifted.toISOString().slice(0, 16)
}

// Form values (all strings) -> the row the database expects.
export function toCoursePayload(values) {
  return {
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    location: values.location.trim(),
    starts_at: new Date(values.startsAt).toISOString(),
    duration_hours: Number(values.durationHours),
    price: Number(values.price),
    capacity: Number(values.capacity),
    image_url: values.imageUrl.trim() || null, // the database accepts null or a URL, not ''
  }
}
