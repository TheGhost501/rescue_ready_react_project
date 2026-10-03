
import Button from './components/ui/Button'
import EmptyState from './components/ui/EmptyState'
import ErrorMessage from './components/ui/ErrorMessage'
import Field from './components/ui/Field'
import Spinner from './components/ui/Spinner'

function App() {
  return (
      <main style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-6)' }}>
        <h1>RescueReady</h1>

        <section style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button variant="danger" disabled>Disabled danger</Button>
        </section>

        <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '24rem' }}>
          <Field label="Email" type="email" hint="We never share it" />
          <Field label="Password" type="password" error="Password must be at least 6 characters" />
          <Field label="Description" as="textarea" />
          <Field label="Level" as="select">
            <option>Beginner</option>
            <option>Advanced</option>
          </Field>
          <Field label="Disabled" disabled defaultValue="Read only" />
        </section>

        <Spinner />
        <ErrorMessage message="Could not load courses." onRetry={() => alert('retry')} />
        <EmptyState message="No courses found." linkTo="/" linkLabel="Clear filters" />
      </main>
  )
}

export default App
