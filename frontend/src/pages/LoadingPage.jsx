// LoadingPage.jsx — the animated loading screen shown while we fetch data from the backend.
//
// `step` is controlled by the parent (App.jsx) using a series of setTimeouts.
// Each timeout increments `step` by 1, which moves the next item in the list from
// "active" (currently running) to "done" (checkmarked).
// Step values: 0 = nothing started, 1–4 = steps 1–4 complete.

export default function LoadingPage({ label, step }) {
  // Each step has three possible states based on the current `step` value:
  //   done   = step index already passed → show a checkmark ✓
  //   active = currently on this step    → highlighted/animated
  //   idle   = hasn't happened yet       → dimmed
  const steps = [
    { label: 'Scraping r/GNV posts',           done: step > 0, active: step === 0 },
    { label: `Extracting ${label} mentions`,   done: step > 1, active: step === 1 },
    { label: 'Running sentiment analysis',     done: step > 2, active: step === 2 },
    { label: 'Ranking results',                done: step > 3, active: step === 3 },
  ]

  return (
    <div className="loading">
      {/* Spinning gem animation — purely decorative, all done in CSS */}
      <div className="loading-visual">
        <div className="loading-ring" />
        <div className="loading-ring-inner" />
        <div className="loading-gem-sm">
          <img src="/paraiba icon.png" alt="gem" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>
      </div>

      <p className="loading-title">Analyzing discussions</p>
      <p className="loading-sub">Finding hidden gems for {label}</p>

      {/* Step list — visually communicates what the app is "doing" while the API responds */}
      <div className="loading-steps">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`loading-step${s.active ? ' active' : ''}${s.done ? ' done' : ''}`}
          >
            <div className="step-dot" />
            {s.done ? '✓ ' : ''}{s.label}
          </div>
        ))}
      </div>
    </div>
  )
}