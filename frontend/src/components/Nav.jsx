// Nav.jsx — the top navigation bar, always visible regardless of which screen is active.
// Intentionally minimal — just the logo/brand name.
// Clicking the logo is the primary "go home" affordance throughout the app.

// Props:
//   onHome — called when user clicks the logo → navigates back to HomePage
export default function Nav({ onHome }) {
  return (
    <nav className="nav">
      {/* The logo doubles as a home button — common pattern, users expect it */}
      <div className="nav-logo" onClick={onHome}>
        <span className="nav-logo-text">Paraíba</span>
      </div>
    </nav>
  )
}