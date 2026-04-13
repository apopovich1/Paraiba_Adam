// CategoryPage.jsx — lets the user pick which category they want to explore.
// Right now there are only two options (Restaurants and Attractions),
// but adding a new one is as simple as appending to the CATEGORIES array below.

import BackBtn from '../components/BackBtn'

// Each category needs:
//   key   — passed to the API as the `category` query param (keep lowercase)
//   label — display name shown on the card
//   icon  — emoji shown as the card's visual
//   sub   — short description line under the label
const CATEGORIES = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍴', sub: 'Local spots & hidden eateries' },
  { key: 'attractions', label: 'Attractions', icon: '🌿', sub: 'Parks, arts & experiences' },
]

// Props:
//   onSelect — called with (key, label) when user clicks a card → triggers data fetch in App.jsx
//   onBack   — called when user hits the back button → goes back to HomePage
export default function CategoryPage({ onSelect, onBack }) {
  return (
    <>
      <BackBtn onClick={onBack} />

      <div className="cat-header fu">
        <p className="cat-eyebrow">Start exploring</p>
        <h2 className="cat-title">What are you looking for?</h2>
      </div>

      {/* Render a card for each category — clicking fires onSelect with that category's key + label */}
      <div className="cat-grid">
        {CATEGORIES.map((c, i) => (
          <div key={c.key} className={`cat-card fu${i + 1}`} onClick={() => onSelect(c.key, c.label)}>
            <div className="cat-icon-wrap">{c.icon}</div>
            <span className="cat-label">{c.label}</span>
            <span className="cat-sublabel">{c.sub}</span>
          </div>
        ))}
      </div>
    </>
  )
}