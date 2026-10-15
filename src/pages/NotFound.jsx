import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <>
      <title>Page not found | RescueReady</title>
      <h1>Page not found</h1>
      <EmptyState message="There is nothing at this address." linkTo="/courses" linkLabel="Back to courses" />
    </>
  )
}
