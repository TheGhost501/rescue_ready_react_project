import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AuthContext } from '../contexts/AuthContext'
import Login from './Login'

// The page gets login from the context, so a test passes in a fake and checks how it was called.
function renderLogin(login) {
  render(
    <MemoryRouter>
      <AuthContext value={{ login }}>
        <Login />
      </AuthContext>
    </MemoryRouter>,
  )
}

describe('Login form', () => {
  test('shows both errors and does not log in when submitted empty', async () => {
    const login = vi.fn()
    const user = userEvent.setup()
    renderLogin(login)

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  test('calls login with the email and password', async () => {
    const login = vi.fn()
    const user = userEvent.setup()
    renderLogin(login)

    await user.type(screen.getByLabelText('Email'), 'emily@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rescue2026')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(login).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledWith({ email: 'emily@example.com', password: 'Rescue2026' })
  })

  test('shows the server error and keeps the email', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Invalid login credentials'))
    const user = userEvent.setup()
    renderLogin(login)

    await user.type(screen.getByLabelText('Email'), 'emily@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rescue2026')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
    expect(screen.getByLabelText('Email')).toHaveValue('emily@example.com')
  })
})
