import { validateCourse, validateRegister, validateReview } from './validators'

// One valid form per validator. Each test changes one field, so a failing test points at one rule.
const validRegister = {
  fullName: 'Emily Clarke',
  role: 'learner',
  email: 'emily@example.com',
  password: 'Rescue2026',
  repeatPassword: 'Rescue2026',
}

const validCourse = {
  title: 'First Aid at Work',
  category: 'first-aid',
  description: 'Three days of practical first aid for the workplace.',
  location: 'Guildford',
  startsAt: '2026-11-01T10:00',
  durationHours: '18',
  price: '199.99',
  capacity: '12',
  imageUrl: '',
}

describe('validateRegister', () => {
  test('accepts valid values', () => {
    expect(validateRegister(validRegister)).toEqual({})
  })

  test('rejects a password without a digit', () => {
    const errors = validateRegister({ ...validRegister, password: 'abcdefgh', repeatPassword: 'abcdefgh' })

    expect(errors).toEqual({ password: 'Include at least one letter and one digit.' })
  })

  test('rejects a repeated password that does not match', () => {
    const errors = validateRegister({ ...validRegister, repeatPassword: 'Rescue2027' })

    expect(errors).toEqual({ repeatPassword: 'The passwords do not match.' })
  })
})

describe('validateCourse', () => {
  // The start date is compared with "now". Fixing "now" keeps these results the same on any day.
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-10-16T12:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('accepts valid values', () => {
    expect(validateCourse(validCourse)).toEqual({})
  })

  test('rejects a start date in the past', () => {
    const errors = validateCourse({ ...validCourse, startsAt: '2026-10-16T11:00' })

    expect(errors).toEqual({ startsAt: 'The start must be in the future.' })
  })

  test('rejects a price with more than two decimal places', () => {
    const errors = validateCourse({ ...validCourse, price: '19.999' })

    expect(errors).toEqual({ price: 'Enter 0 or more, with at most two decimal places.' })
  })

  test('rejects a capacity below the places already booked', () => {
    const errors = validateCourse({ ...validCourse, capacity: '3' }, 5)

    expect(errors).toEqual({ capacity: '5 places are already booked.' })
  })
})

describe('validateReview', () => {
  test('rejects a missing rating and a short comment', () => {
    const errors = validateReview({ rating: '', comment: 'Too short' })

    expect(errors).toEqual({
      rating: 'Choose a rating from 1 to 5.',
      comment: 'Use 10 to 500 characters.',
    })
  })
})
