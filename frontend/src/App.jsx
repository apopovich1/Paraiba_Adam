// App.jsx — the root of the whole app.
// All screen navigation lives here. Think of `screen` as the app's "current page" —
// instead of using React Router, we just swap out which component renders based on that string.

import { useEffect, useState } from 'react'
import axios from 'axios'
import css from './styles/styles'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import LoadingPage from './pages/LoadingPage'
import ResultsPage from './pages/ResultsPage'
import DetailPage from './pages/DetailPage'

// Pull the backend URL from the .env file (VITE_API_URL).
// The .replace strips a trailing slash if someone accidentally added one,
// so URLs like /api/paraiba don't become //api/paraiba.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Safety wrapper: if the API ever sends back something unexpected (not an array),
// this just returns an empty array instead of crashing the app.
const normalizePlaces = (payload) => (Array.isArray(payload) ? payload : [])

export default function App() {
  // `places` — the list of restaurants/attractions currently shown in ResultsPage
  const [places, setPlaces] = useState([])

  // `screen` — controls which page is visible. Possible values:
  //   'home' | 'category' | 'loading' | 'results' | 'detail'
  const [screen, setScreen] = useState('home')

  // `category` — the raw key passed to the API (e.g. 'restaurants', 'attractions')
  const [category, setCategory] = useState(null)

  // `label` — the human-readable version of the category (e.g. 'Restaurants'),
  // used for display text in LoadingPage and ResultsPage
  const [label, setLabel] = useState('')

  // `loadStep` — drives the step-by-step animation in LoadingPage (0 = nothing done, 4 = all done)
  const [loadStep, setLoadStep] = useState(0)

  // `place` — the single place the user clicked on, passed down to DetailPage
  const [place, setPlace] = useState(null)

  // Scroll back to the top whenever the screen changes.
  // Without this, switching screens would leave you mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [screen])

  // Reset to the home screen and clear the loading step counter
  const goHome = () => { setScreen('home'); setLoadStep(0) }

  // Fired when the user picks a category (restaurants or attractions).
  // Kicks off the loading animation and fetches data from the API in parallel.
  const handleCategory = async (cat, lbl) => {
    setCategory(cat); setLabel(lbl); setLoadStep(0)
    setScreen('loading')

    // Fire each step of the loading animation 300ms apart.
    // This gives the illusion of "work happening" while we wait for the API.
    ;[0, 1, 2, 3].forEach(i => {
      setTimeout(() => setLoadStep(i + 1), 300 + i * 300)
    })

    // We run the API call and a minimum delay at the same time using Promise.all.
    // - If the API is fast: we still wait the full 1400ms so the animation completes.
    // - If the API is slow: we wait for it, no extra padding on top.
    // This avoids the old bug where we'd jump to results before the animation finished,
    // or worse — wait a hardcoded 2600ms even when data was already ready.
    const minDelay = new Promise(resolve => setTimeout(resolve, 1400))

    try {
      // Map our internal category keys to the keywords the backend expects
      const keyword = cat === 'restaurants' ? 'Restaurant'
                    : cat === 'cafes' ? 'Cafe'
                    : 'Attraction'

      // Wait for both the API response AND the minimum delay to finish
      const [res] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/paraiba?category=${keyword}&limit=50`),
        minDelay,
      ])

      const nextPlaces = normalizePlaces(res.data)
      if (!Array.isArray(res.data)) {
        console.error('Expected array response for places, received:', res.data)
      }
      setPlaces(nextPlaces)
    } catch (err) {
      console.error('Failed to fetch places:', err)
      setPlaces([])
      await minDelay  // still honor the minimum delay so the animation doesn't flash on error
    }

    setScreen('results')
  }

  // Called by ResultsPage whenever the user toggles a filter chip.
  // The backend ORs normal type filters together, but treats indoor/outdoor
  // as narrowing constraints so they don't pull in unrelated results.
  const handleRefilter = async (cat, filters) => {
    try {
      const keyword = cat === 'restaurants' ? 'Restaurant'
                    : cat === 'cafes' ? 'Cafe'
                    : 'Attraction'

      // Build query params. If filters are selected, join them as a comma-separated string.
      // The backend splits them into type filters vs. setting filters.
      const params = new URLSearchParams({ category: keyword, limit: 50 })
      if (filters.length > 0) params.append('categoryType', filters.join(','))

      const res = await axios.get(`${API_BASE_URL}/api/paraiba?${params.toString()}`)
      const nextPlaces = normalizePlaces(res.data)
      if (!Array.isArray(res.data)) {
        console.error('Expected array response for places, received:', res.data)
      }
      setPlaces(nextPlaces)
    } catch (err) {
      console.error('Failed to fetch places:', err)
      setPlaces([])
    }
  }

  return (
    <>
      {/* Inject all our styles as a JS string — see styles/styles.js */}
      <style>{css}</style>

      {/* Nav is always visible regardless of which screen we're on */}
      <Nav onHome={goHome} />

      {/* `key={screen}` forces React to remount the page component on every
          screen change, so fade-in animations replay from scratch each time */}
      <div className="page" key={screen}>
        {screen === 'home'     && <HomePage onExplore={() => setScreen('category')} />}
        {screen === 'category' && <CategoryPage onSelect={handleCategory} onBack={goHome} />}
        {screen === 'loading'  && <LoadingPage label={label} step={loadStep} />}
        {screen === 'results'  && (
          <ResultsPage
            places={places}
            category={category}
            label={label}
            onSelect={(p) => { setPlace(p); setScreen('detail') }}  // user clicked a place card
            onBack={() => setScreen('category')}
            onRefilter={handleRefilter}
          />
        )}
        {screen === 'detail'   && <DetailPage place={place} label={label} onBack={() => setScreen('results')} />}
      </div>
    </>
  )
}
