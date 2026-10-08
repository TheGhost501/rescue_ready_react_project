import { Link, useLocation } from 'react-router'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import Field from '../components/ui/Field'
import FormCard from '../components/ui/FormCard'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import { validateLogin } from '../utils/validators'

export default function Login() {
  const location = useLocation()
  const { login } = useAuth()
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: login,
  })

  return (
    <>
      <title>Log in | RescueReady</title>
      <FormCard
        title="Log in"
        intro="Book a place, manage your bookings and review the courses you attended."
        footer={
          <>
            {/* location.state carries the page the guest came from, so registering returns there too. */}
            New to RescueReady? <Link to="/register" state={location.state}>Create an account</Link>
          </>
        }
      >
        <form onSubmit={form.handleSubmit} noValidate>
          {form.submitError && <ErrorMessage message={form.submitError} />}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.password}
          />
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </FormCard>
    </>
  )
}
