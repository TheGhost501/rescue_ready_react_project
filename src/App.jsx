import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<h1>Placeholder</h1>} />
      </Route>
    </Routes>
  )
}


