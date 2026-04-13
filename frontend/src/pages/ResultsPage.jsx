// ResultsPage.jsx — shows the ranked list of places + a filter sidebar.
// The filter sidebar lets users narrow results by cuisine type, setting, etc.
// Filtering re-fetches from the backend (via onRefilter) instead of just hiding cards locally,
// so the ranking stays accurate for whatever subset is selected.

import { useState } from 'react'
import BackBtn from '../components/BackBtn'

// ─── FILTER DEFINITIONS ────────────────────────────────────────────────────
// These are the filter buttons shown in the sidebar.
// `key` must match what's stored in the database's `categoryType` field — the backend
// does a regex match on it, so spelling here matters.

const RESTAURANT_GROUPS = [
  {
    group: 'Cuisine',
    cats: [
      { key: 'american',      label: 'American',      icon: '🍔' },
      { key: 'italian',       label: 'Italian',       icon: '🍝' },
      { key: 'mexican',       label: 'Mexican',       icon: '🌮' },
      { key: 'japanese',      label: 'Japanese',      icon: '🍣' },
      { key: 'chinese',       label: 'Chinese',       icon: '🥢' },
      { key: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
      { key: 'thai',          label: 'Thai',          icon: '🥜' },
      { key: 'indian',        label: 'Indian',        icon: '🍛' },
      { key: 'korean',        label: 'Korean',        icon: '🥘' },
      { key: 'vietnamese',    label: 'Vietnamese',    icon: '🍜' },
      { key: 'bbq',           label: 'BBQ',           icon: '🔥' },
      { key: 'seafood',       label: 'Seafood',       icon: '🦞' },
      { key: 'burgers',       label: 'Burgers',       icon: '🍔' },
      { key: 'sandwiches',    label: 'Sandwiches',    icon: '🥪' },
      { key: 'caribbean',     label: 'Caribbean',     icon: '🌴' },
      { key: 'steakhouse',    label: 'Steakhouse',    icon: '🥩' },
    ],
  },
  {
    group: 'Cafe & Drinks',
    cats: [
      { key: 'cafe',     label: 'Cafe',     icon: '☕' },
      { key: 'bakery',   label: 'Bakery',   icon: '🥐' },
      { key: 'dessert',  label: 'Dessert',  icon: '🍨' },
      { key: 'bar',      label: 'Bar',      icon: '🍸' },
      { key: 'brewery',  label: 'Brewery',  icon: '🍺' },
      { key: 'winery',   label: 'Winery',   icon: '🍷' },
    ],
  },
  {
    group: 'Dining Options',
    cats: [
      { key: 'indoor',  label: 'Indoor',  icon: '🏠' },
      { key: 'outdoor', label: 'Outdoor', icon: '🌿' },
    ],
  },
]

const ATTRACTION_GROUPS = [
  {
    group: 'Outdoors & Nature',
    cats: [
      { key: 'hiking',       label: 'Hiking',         icon: '🥾' },
      { key: 'park',         label: 'Parks',          icon: '🌳' },
      { key: 'water sports', label: 'Water Sports',   icon: '🛶' },
      { key: 'swimming',     label: 'Swimming',       icon: '🏊' },
      { key: 'cycling',      label: 'Cycling',        icon: '🚴' },
      { key: 'camping',      label: 'Camping',        icon: '⛺' },
      { key: 'wildlife',     label: 'Wildlife',       icon: '🦅' },
      { key: 'water body',   label: 'Lakes & Rivers', icon: '💧' },
    ],
  },
  {
    group: 'Arts & Entertainment',
    cats: [
      { key: 'museum',          label: 'Museum',        icon: '🏛️' },
      { key: 'performing arts', label: 'Arts & Theater',icon: '🎭' },
      { key: 'arcade',          label: 'Arcade & Fun',  icon: '🎮' },
      { key: 'fitness',         label: 'Fitness',       icon: '🏋️' },
      { key: 'market',          label: 'Markets',       icon: '🛍️' },
    ],
  },
  {
    group: 'Setting',
    cats: [
      { key: 'indoor',         label: 'Indoor',           icon: '🏠' },
      { key: 'outdoor',        label: 'Outdoor',          icon: '🌿' },
    ],
  },
]

// How many result cards to show before the "Show more" button appears
const PAGE_SIZE = 10

// ─── COMPONENT ─────────────────────────────────────────────────────────────
// Props:
//   places      — array of place objects from the backend
//   category    — 'restaurants' | 'attractions' (used to pick the right filter groups)
//   label       — display name like "Restaurants" (shown in the heading)
//   onSelect    — called with a place object when user clicks a card → goes to DetailPage
//   onBack      — called when user hits the back button → goes back to CategoryPage
//   onRefilter  — called with (category, selectedKeys[]) whenever filters change → re-fetches from API
export default function ResultsPage({ places, category, label, onSelect, onBack, onRefilter }) {
  // Array of filter keys the user has toggled on, e.g. ['american', 'mexican']
  const [selectedTypes, setSelectedTypes] = useState([])

  // How many cards are currently visible (increases when user clicks "Show more")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Controls whether the mobile filter drawer is open or closed
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Guard against the API returning null or undefined
  const safePlaces = Array.isArray(places) ? places : []

  // Show restaurant filters for the restaurant screen, attraction filters otherwise
  const groups = category === 'restaurants' ? RESTAURANT_GROUPS : ATTRACTION_GROUPS

  // Both restaurant "Dining Options" and attraction "Setting" should render as checkboxes.
  const isCheckboxGroup = (groupName) => ['Dining Options', 'Setting'].includes(groupName)

  // Reset pagination and ask the parent to re-fetch with the new filters
  const applyFilters = (newTypes) => {
    setVisibleCount(PAGE_SIZE)
    onRefilter(category, newTypes)
  }

  // Toggle a filter key on or off.
  // If it's already selected → remove it. Otherwise → add it.
  // Then immediately re-fetch with the updated list.
  const handleToggle = (key) => {
    const next = selectedTypes.includes(key)
      ? selectedTypes.filter(k => k !== key)
      : [...selectedTypes, key]
    setSelectedTypes(next)
    applyFilters(next)
  }

  // Deselect everything and go back to unfiltered results
  const clearAll = () => {
    setSelectedTypes([])
    applyFilters([])
  }

  // Slice the full list down to however many cards are currently visible
  const visiblePlaces = safePlaces.slice(0, visibleCount)
  const hasMore = visibleCount < safePlaces.length

  // ─── HELPER: getPrimaryType ──────────────────────────────────────────────
  // Returns the "main" type label for a place, skipping generic/setting tags.
  // Used as a fallback when getDisplayTypes returns nothing.
  // e.g. "american, indoor" → "American"
  const getPrimaryType = (place) => {
    // categoryType can come back as an array or a comma-separated string — handle both
    const rawTypes = Array.isArray(place.categoryType)
      ? place.categoryType
      : typeof place.categoryType === 'string'
      ? place.categoryType.split(',')
      : []

    // Strip whitespace, drop empty strings, and filter out setting/generic tags
    const cleanedTypes = rawTypes
      .map(type => String(type).trim())
      .filter(Boolean)
      .filter(type => !['indoor', 'outdoor', 'indoor/outdoor', 'general'].includes(type.toLowerCase()))

    if (cleanedTypes.length === 0) return null

    // Capitalize each word in the primary type
    const primary = cleanedTypes[0]
    return primary
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // ─── HELPER: getDisplayTypes ─────────────────────────────────────────────
  // Returns up to 3 type labels to show as chips on a result card.
  // Unlike getPrimaryType, this keeps setting tags like "Indoor" / "Outdoor",
  // but still filters out the meaningless "general" tag.
  const getDisplayTypes = (place) => {
    const rawTypes = Array.isArray(place.categoryType)
      ? place.categoryType
      : typeof place.categoryType === 'string'
      ? place.categoryType.split(',')
      : []

    return rawTypes
      .map(type => String(type).trim())
      .filter(Boolean)
      .filter(type => type.toLowerCase() !== 'general')
      .slice(0, 3)
      .map(type =>
        type
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
  }

  // ─── SIDEBAR ─────────────────────────────────────────────────────────────
  // Defined as a variable so we can reuse it in both the desktop layout
  // and the mobile drawer without duplicating JSX.
  const sidebar = (
    <aside className="results-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <p className="sidebar-section-label">Filter by type</p>
          {/* Only show "Clear all" when at least one filter is active */}
          {selectedTypes.length > 0 && (
            <button className="sidebar-clear-btn" onClick={clearAll}>Clear all</button>
          )}
        </div>

        {groups.map(g => (
          <div key={g.group} className="sidebar-group-card">
            <p className="sidebar-group-title">{g.group}</p>

            {/* Indoor/outdoor groups get a checkbox style; others stay as pill buttons */}
            <div className={`sidebar-filter-list${isCheckboxGroup(g.group) ? ' checkbox-list' : ''}`}>
              {g.cats.map(c => (
                <button
                  key={c.key}
                  className={`sidebar-filter-item${selectedTypes.includes(c.key) ? ' active' : ''}${isCheckboxGroup(g.group) ? ' checkbox-item' : ''}`}
                  onClick={() => handleToggle(c.key)}
                >
                  <span className="sidebar-filter-pill">
                    {/* Render a custom checkbox box only for indoor/outdoor groups */}
                    {isCheckboxGroup(g.group) && (
                      <span className={`sidebar-checkbox-box${selectedTypes.includes(c.key) ? ' active' : ''}`}>
                        {selectedTypes.includes(c.key) ? '✓' : ''}
                      </span>
                    )}
                    <span className="sidebar-filter-label">{c.label}</span>
                    {/* Show a checkmark on active pills (not on checkbox-style items — they have their own) */}
                    {!isCheckboxGroup(g.group) && selectedTypes.includes(c.key) && (
                      <span className="sidebar-filter-check">✓</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <BackBtn onClick={onBack} />

      {/* Page heading */}
      <div className="results-header fu">
        <p className="results-eyebrow">Ranked by sentiment + local engagement</p>
        <h2 className="results-title">Top <span>{label}</span> in GNV</h2>
        {/* Subtle indicator so users know filters are active */}
        {selectedTypes.length > 0 && (
          <p className="results-filter-hint">{selectedTypes.length} filter{selectedTypes.length > 1 ? 's' : ''} active</p>
        )}
      </div>

      {/* Mobile only: toggle button that opens/closes the filter drawer */}
      <button className="mobile-filter-btn" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? 'Hide Filters' : `Filters${selectedTypes.length > 0 ? ' (' + selectedTypes.length + ')' : ''}`}
      </button>
      {sidebarOpen && <div className="mobile-sidebar-drawer">{sidebar}</div>}

      {/* Desktop two-column layout: sidebar on the left, cards on the right */}
      <div className="results-layout">
        <div className="results-sidebar-wrap">{sidebar}</div>

        <div className="results-main">
          {/* Empty state — show a helpful message if no places match the current filters */}
          {safePlaces.length === 0 ? (
            <div className="error-state" style={{ marginTop: '40px' }}>
              <span className="error-icon">🔍</span>
              <p className="error-title">No results found</p>
              <p className="error-sub">Try adjusting your filters</p>
              <button className="error-btn" onClick={clearAll}>Clear Filters</button>
            </div>
          ) : (
            visiblePlaces.map((p, i) => (
              // Each card is clickable and navigates to that place's detail page
              <div
                key={p._id}
                className={`result-card fu${Math.min(i + 1, 5)}${i === 0 ? ' top' : ''}`}
                onClick={() => onSelect(p)}
              >
                <div className="result-header-row">
                  <p className="result-name">{p.name}</p>
                  <p className="result-score-line">Gem Score {p.ranking}</p>
                </div>

                {/* Description: prefer the stored description, fall back to the first comment */}
                <p className="result-desc" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,           // clamp to 2 lines with ellipsis
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {p.description
                    ? p.description
                    : p.comments && p.comments.length > 0
                    ? `"${p.comments[0].text}"`
                    : null}
                </p>

                {/* Type chips — shows up to 3 type tags, or just the primary type as plain text */}
                <div className="result-meta-row bottom">
                  {getDisplayTypes(p).length > 0 ? (
                    getDisplayTypes(p).map(type => (
                      <span key={type} className="result-chip subtle">{type}</span>
                    ))
                  ) : getPrimaryType(p) ? (
                    <span className="result-meta-text">{getPrimaryType(p)}</span>
                  ) : null}
                </div>

                <span className="result-cta">View details →</span>
              </div>
            ))
          )}

          {/* "Show more" button — reveals the next PAGE_SIZE results without re-fetching */}
          {hasMore && (
            <button
              className="load-more-btn"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              Show more results
              <span className="load-more-count">
                {safePlaces.length - visibleCount} remaining
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
