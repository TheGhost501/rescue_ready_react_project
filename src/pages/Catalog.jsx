import { useEffect, useState } from 'react'
import CourseCard from '../components/courses/CourseCard'
import CourseFilters from '../components/courses/CourseFilters'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import { useDebounce } from '../hooks/useDebounce'
import { getCourses } from '../services/courseService'
import styles from './Catalog.module.css'

const defaultFilters = { search: '', category: '', when: 'upcoming', sort: 'starts_at' }

export default function Catalog() {
  const [state, setState] = useState({ status: 'loading', courses: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState(defaultFilters.search)
  const [category, setCategory] = useState(defaultFilters.category)
  const [when, setWhen] = useState(defaultFilters.when)
  const [sort, setSort] = useState(defaultFilters.sort)
  // The search box updates search on every key; the request waits until typing pauses.
  const debouncedSearch = useDebounce(search)

  // Mount: loads the first list. Update: any filter (or "Try again") changes a dependency, so React
  // runs the cleanup of the previous run and then this again. Unmount: the cleanup runs one last time.
  // The cleanup marks the old request as stale: answers can arrive out of order, and only the newest
  // one may reach the screen.
  useEffect(() => {
    let ignore = false

    getCourses({ search: debouncedSearch, category, when, sort })
      .then((courses) => {
        if (!ignore) setState({ status: 'success', courses, error: '' })
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', courses: [], error: error.message })
      })

    return () => {
      ignore = true
    }
  }, [debouncedSearch, category, when, sort, attempt])

  function retry() {
    setState({ status: 'loading', courses: [], error: '' })
    setAttempt((current) => current + 1)
  }

  const setters = { search: setSearch, category: setCategory, when: setWhen, sort: setSort }

  function handleFilterChange(name, value) {
    setters[name](value)
  }

  function clearFilters() {
    setSearch(defaultFilters.search)
    setCategory(defaultFilters.category)
    setWhen(defaultFilters.when)
    setSort(defaultFilters.sort)
  }

  // Sort only changes the order, so it does not count as narrowing the list.
  const isFiltered = search.trim() !== '' || category !== defaultFilters.category || when !== defaultFilters.when

  return (
    <>
      <title>Courses | RescueReady</title>
      <h1>Courses</h1>
      <CourseFilters values={{ search, category, when, sort }} onChange={handleFilterChange} />
      {state.status === 'loading' && <Spinner label="Loading courses…" />}
      {state.status === 'error' && <ErrorMessage message={state.error} onRetry={retry} />}
      {state.status === 'success' && state.courses.length === 0 && isFiltered && (
        <div className={styles.empty}>
          <EmptyState message="No courses match your search." />
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
      {state.status === 'success' && state.courses.length === 0 && !isFiltered && (
        <EmptyState message="There are no upcoming courses right now." />
      )}
      {state.status === 'success' && state.courses.length > 0 && (
        <ul className={styles.grid}>
          {state.courses.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
