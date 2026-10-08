import { Link, useLocation } from 'react-router'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import Field from '../components/ui/Field'
import FormCard from '../components/ui/FormCard'
import RadioGroup from '../components/ui/RadioGroup'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import { ROLES } from '../utils/constants'
import { validateRegister } from '../utils/validators'

const initialValues = { fullName: '', role: 'learner', email: '', password: '', repeatPassword: '' }

export default function Register() {
  const location = useLocation()
  const { register } = useAuth()
  const form = useForm({ initialValues, validate: validateRegister, onSubmit: register })

  return (
    <>
      <title>Register | RescueReady</title>
      <FormCard
        title="Register"
        intro="Create an account to book safety and first aid courses."
        footer={
          <>
            Already have an account? <Link to="/login" state={location.state}>Log in</Link>
          </>
        }
      >
        <form onSubmit={form.handleSubmit} noValidate>
          {form.submitError && <ErrorMessage message={form.submitError} />}
          <Field
            label="Full name"
            name="fullName"
            autoComplete="name"
            value={form.values.fullName}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.fullName}
          />
          <RadioGroup
            legend="Account type"
            hint="You cannot change this later."
            name="role"
            options={ROLES}
            value={form.values.role}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.role}
          />
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
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a digit."
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.password}
          />
          <Field
            label="Repeat password"
            name="repeatPassword"
            type="password"
            autoComplete="new-password"
            value={form.values.repeatPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.repeatPassword}
          />
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </FormCard>
    </>
  )
}
