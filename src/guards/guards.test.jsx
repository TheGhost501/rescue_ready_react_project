import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import App from '../App'
import { AuthContext } from '../contexts/AuthContext'

// Replace everything that talks to Supabase, so the tests never reach the live database and run
// without .env.local. The pages these tests land on find no courses and no bookings.
vi.mock('../lib/supabaseClient', () => ({ supabase: {} }))
vi.mock('../services/courseService', () => ({ getCourses: vi.fn().mockResolvedValue([]) }))
vi.mock('../services/bookingService', () => ({ getMyBookings: vi.fn().mockResolvedValue([]) }))

// Fake auth values in the shape AuthProvider shares. The header reads the profile whenever a user is set.
const actions = { login: vi.fn(), register: vi.fn(), logout: vi.fn() }
const guest = { user: null, profile: null, isLoading: false, ...actions }
const learner = {
  user: { id: 'u1' },
  profile: { id: 'u1', full_name: 'Test Learner', role: 'learner' },
  isLoading: false,
  ...actions,
}
const instructor = { ...learner, profile: { ...learner.profile, role: 'instructor' } }

// MemoryRouter has no address bar, so the current path is rendered where a test can read it.
function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>
}

// entry is a path, or { pathname, state } to start with router state, as after a redirect.
function renderAt(entry, auth) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthContext value={auth}>
        <App />
        <CurrentPath />
      </AuthContext>
    </MemoryRouter>,
  )
}

describe('PrivateRoute', () => {
  test('sends a guest to the login page', () => {
    renderAt('/my-bookings', guest)

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
  })

  test('waits while the session is restored, without redirecting', () => {
    renderAt('/my-bookings', { ...guest, isLoading: true })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/my-bookings')
  })
})

describe('InstructorRoute', () => {
  test('sends a learner to the catalog', async () => {
    renderAt('/courses/create', learner)

    expect(await screen.findByText('There are no upcoming courses right now.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Courses' })).toBeInTheDocument()
  })

  test('lets an instructor in', async () => {
    renderAt('/courses/create', instructor)

    // The Create page is lazy-loaded, so it appears a moment after the first render.
    expect(await screen.findByRole('heading', { name: 'Create course' })).toBeInTheDocument()
  })
})

describe('GuestRoute', () => {
  test('sends a user who has just logged in back to the page they wanted', async () => {
    renderAt({ pathname: '/login', state: { from: { pathname: '/my-bookings' } } }, learner)

    expect(await screen.findByText('You have not booked any courses yet.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My bookings' })).toBeInTheDocument()
  })
})
