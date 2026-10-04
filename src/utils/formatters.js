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

// (4.5, 3) -> '4.5 (3 reviews)'. The average is null when there are no reviews.
export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return 'No reviews yet'
  return `${Number(averageRating).toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
}
