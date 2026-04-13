// HomePage.jsx — the landing page users see when they first open the app.
// Purely presentational — no state, no API calls.
// The only interactive element is the "Start Exploring" button.

import GemLogo from '../components/GemLogo'

// Props:
//   onExplore — called when user clicks "Start Exploring" → navigates to CategoryPage
export default function HomePage({ onExplore }) {
  return (
    <div className="home">
      {/* Animated gem logo — the `fu` class triggers the fade-up entrance animation */}
      <div className="fu"><GemLogo size={52} /></div>

      <p className="home-eyebrow fu1">Powered by local Reddit discussions</p>
      <h1 className="home-title fu2">Find the <em>hidden gems</em> of your city.</h1>
      <p className="home-sub fu3">
        We parse thousands of Reddit posts, extract sentiment, and rank local spots that tourists never find.
      </p>

      <button className="home-btn fu4" onClick={onExplore}>Start Exploring</button>

      {/* Quick stat strip that communicates what the app is built on at a glance */}
      <div className="home-stats fu5">
        <div className="stat">
          <span className="stat-num">r/GNV</span>
          <span className="stat-label">Source Subreddit</span>
        </div>
        <div className="stat">
          <span className="stat-num">NLP</span>
          <span className="stat-label">Sentiment Analysis</span>
        </div>
        <div className="stat">
          <span className="stat-num">GNV</span>
          <span className="stat-label">Gainesville, FL</span>
        </div>
      </div>
    </div>
  )
}