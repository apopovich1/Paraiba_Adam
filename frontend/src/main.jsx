// main.jsx — the entry point for the React app.
// This is the file Vite looks at first. It mounts the <App /> component
// into the #root div defined in index.html.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // global base styles (resets, fonts, etc.)
import App from './App.jsx'

// StrictMode intentionally renders components twice in development
// to help catch bugs like side effects running at the wrong time.
// It has zero effect in production builds, so it's safe to leave on.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)