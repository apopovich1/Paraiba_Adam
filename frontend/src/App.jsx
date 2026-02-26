import { useState } from "react"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; }
  body { background: #f7f6f2; font-family: 'Jost', sans-serif; color: #1a1a2e; -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }

  .fu  { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .fu1 { animation: fadeUp 0.5s 0.07s  cubic-bezier(0.22,1,0.36,1) both; }
  .fu2 { animation: fadeUp 0.5s 0.14s  cubic-bezier(0.22,1,0.36,1) both; }
  .fu3 { animation: fadeUp 0.5s 0.21s  cubic-bezier(0.22,1,0.36,1) both; }
  .fu4 { animation: fadeUp 0.5s 0.28s  cubic-bezier(0.22,1,0.36,1) both; }
  .fu5 { animation: fadeUp 0.5s 0.35s  cubic-bezier(0.22,1,0.36,1) both; }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; justify-content: center; align-items: center;
    padding: 18px 40px;
    border-bottom: 1px solid rgba(26,26,46,0.07);
    background: rgba(247,246,242,0.9);
    backdrop-filter: blur(20px);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 9px;
    cursor: pointer; user-select: none;
  }
  .nav-logo-text {
    font-family: 'Libre Baskerville', serif;
    font-size: 20px; font-weight: 700;
    letter-spacing: 0.01em; color: #1a1a2e;
    line-height: 1;
  }

  /* ── PAGE ── */
  .page {
    width: 100%; max-width: 860px;
    margin: 0 auto;
    padding: 100px 28px 80px;
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
  }

  /* ── BACK BTN ── */
  .back {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-family: 'Jost', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9ca3af;
    padding: 0; align-self: flex-start;
    transition: color 0.2s; margin-bottom: 40px;
  }
  .back:hover { color: #1a1a2e; }
`

const PLACES = {
  restaurants: [
    { id: 1, name: "Satch's Pizza", address: "1800 W University Ave, Gainesville, FL", desc: "A Gainesville staple loved by locals for decades. Incredible brick-oven slices tucked away from tourist trails.", sentiment: "94% positive", mentions: "142 mentions" },
    { id: 2, name: "Leonardo's By the Slice", address: "1245 W University Ave, Gainesville, FL", desc: "Old-school pizza joint near campus, consistently praised for its authentic flavors and unassuming vibe.", sentiment: "89% positive", mentions: "98 mentions" },
    { id: 3, name: "Emiliano's Cafe", address: "7 SE 1st Ave, Gainesville, FL", desc: "Latin-inspired dishes made with local ingredients. A hidden gem that regulars fiercely protect.", sentiment: "87% positive", mentions: "76 mentions" },
    { id: 4, name: "Dragonfly Sushi", address: "201 SE 2nd Ave, Gainesville, FL", desc: "Creative sushi in a cozy setting. Locals rave about the omakase options unavailable on main menus.", sentiment: "85% positive", mentions: "61 mentions" },
    { id: 5, name: "Ward's Supermarket Deli", address: "516 NW 23rd Ave, Gainesville, FL", desc: "Old Florida charm with a legendary deli counter. More of an experience than just a meal.", sentiment: "82% positive", mentions: "54 mentions" },
  ],
  cafes: [
    { id: 1, name: "Volta Coffee", address: "1300 NW 17th Ave, Gainesville, FL", desc: "Third-wave coffee done right. A local favorite for serious coffee drinkers and remote workers alike.", sentiment: "96% positive", mentions: "188 mentions" },
    { id: 2, name: "Maude's Classic Cafe", address: "101 SE 2nd Pl, Gainesville, FL", desc: "Bohemian vibes, excellent espresso, and a loyal local crowd. The anti-Starbucks of Gainesville.", sentiment: "91% positive", mentions: "134 mentions" },
    { id: 3, name: "Karma Cream", address: "621 W University Ave, Gainesville, FL", desc: "Organic soft-serve and coffee in a laid-back setting. Adored by the local community for years.", sentiment: "88% positive", mentions: "89 mentions" },
    { id: 4, name: "Pascal's Coffeehouse", address: "1132 W University Ave, Gainesville, FL", desc: "Quiet, unpretentious spot near campus. Perfect for long study sessions with great pour-overs.", sentiment: "86% positive", mentions: "72 mentions" },
    { id: 5, name: "Sweetwater Coffee Bar", address: "300 SW 4th Ave, Gainesville, FL", desc: "Intimate neighborhood cafe with rotating single-origin beans and homemade pastries.", sentiment: "83% positive", mentions: "58 mentions" },
  ],
  parks: [
    { id: 1, name: "Sweetwater Wetlands", address: "3510 NW 34th St, Gainesville, FL", desc: "A stunning urban wetlands that locals treat as their secret nature escape. Incredible birdwatching.", sentiment: "97% positive", mentions: "210 mentions" },
    { id: 2, name: "Paynes Prairie Preserve", address: "100 Savannah Blvd, Micanopy, FL", desc: "Wild Florida at its finest — bison, wild horses, and endless trails hidden in plain sight.", sentiment: "95% positive", mentions: "176 mentions" },
    { id: 3, name: "Depot Park", address: "200 SE Depot Ave, Gainesville, FL", desc: "Renovated historic rail yard turned community park. A beloved local gathering spot with great trails.", sentiment: "90% positive", mentions: "121 mentions" },
    { id: 4, name: "Boulware Springs Park", address: "3300 SE 15th St, Gainesville, FL", desc: "Historic springs park along the Gainesville-Hawthorne Trail. A peaceful local secret.", sentiment: "88% positive", mentions: "94 mentions" },
    { id: 5, name: "Hogtown Creek Headwaters", address: "1520 NW 4th St, Gainesville, FL", desc: "A serene nature preserve winding through residential Gainesville. Underrated and beautiful.", sentiment: "85% positive", mentions: "67 mentions" },
  ],
}

const COMMENTS = [
  { text: "This place is absolutely a hidden gem — been going for 5 years and it never disappoints.", upvotes: 326, source: "r/GNV" },
  { text: "Locals only know about this. Please don't let tourists find out.", upvotes: 218, source: "r/Gainesville" },
  { text: "Stumbled on this by accident and it completely changed my view of GNV.", upvotes: 194, source: "r/GNV" },
  { text: "Way better than anything on the tourist lists. Authentic and affordable.", upvotes: 128, source: "r/Florida" },
]

const ICONS = { restaurants: "🍴", cafes: "☕", parks: "🌿" }

function GemLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polygon points="16,2 26,10 16,13 6,10" fill="#2ec4b6" fillOpacity="0.9"/>
      <polygon points="6,10 16,13 11,28 2,16" fill="#1a9e92" fillOpacity="0.85"/>
      <polygon points="26,10 30,16 21,28 16,13" fill="#2ec4b6" fillOpacity="0.6"/>
      <polygon points="16,13 21,28 11,28" fill="#23b0a4" fillOpacity="0.75"/>
      <polygon points="16,2 26,10 30,16 21,28 11,28 2,16 6,10" fill="none" stroke="#2ec4b6" strokeWidth="0.75" strokeLinejoin="round"/>
      <line x1="6" y1="10" x2="26" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      <line x1="6" y1="10" x2="16" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
      <line x1="26" y1="10" x2="16" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
    </svg>
  )
}

function Nav({ onHome }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={onHome}>
        <span className="nav-logo-text">Paraíba</span>
      </div>
    </nav>
  )
}

function BackBtn({ onClick }) {
  return (
    <button className="back" onClick={onClick}>← Back</button>
  )
}

export default function App() {
  const [screen, setScreen] = useState("home")

  const goHome = () => setScreen("home")

  return (
    <>
      <style>{css}</style>
      <Nav onHome={goHome} />
      <div className="page" key={screen}>
        <p>Paraíba — screen: {screen}</p>
      </div>
    </>
  )
}