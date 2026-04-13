// DetailPage.jsx — full info page for a single place.
// Shows the Gem Score, sentiment stats, an embedded map, Reddit comments, and Google reviews.
// Receives the full `place` object from App via ResultsPage — no extra API call needed here.

import BackBtn from "../components/BackBtn";
import PlaceMap from "../components/PlaceMap";

// Props:
//   place  — the full place object (from MongoDB via the backend)
//   label  — display category name, e.g. "Restaurants" (shown as a breadcrumb)
//   onBack — called when user hits the back button → returns to ResultsPage
export default function DetailPage({ place, label, onBack }) {

  // ─── HELPER: truncateText ──────────────────────────────────────────────
  // Cuts a string to `maxLength` characters and adds "..." if it's too long.
  // Used to keep the hero description from overflowing on small screens.
  const truncateText = (text, maxLength = 140) => {
    const normalized = String(text).trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength).trimEnd()}...`;
  };

  // ─── TYPE TAGS ─────────────────────────────────────────────────────────
  // `categoryType` can arrive as an array OR a comma-separated string depending
  // on how the place was scraped — normalize both into an array first.
  const rawTypes = Array.isArray(place.categoryType)
    ? place.categoryType
    : typeof place.categoryType === "string"
    ? place.categoryType.split(",")
    : [];

  // Clean up, capitalize, and limit to 4 tags to display under the place name.
  // We filter out "general" because it's just an internal catch-all tag that means nothing to users.
  const displayTypes = rawTypes
    .map((type) => String(type).trim())
    .filter(Boolean)
    .filter((type) => type.toLowerCase() !== "general")
    .slice(0, 4)
    .map((type) =>
      type.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    );

  // ─── SENTIMENT ────────────────────────────────────────────────────────
  // The field name is inconsistent in older vs newer DB documents, so check both.
  const sentimentValue = place.sentimentRating ?? place.sentimentrating;

  // ─── GOOGLE REVIEWS ───────────────────────────────────────────────────
  // Google reviews can be stored as plain strings or as objects with a `text` field.
  // Normalize everything into plain strings and drop any empty values.
  const googleReviews = Array.isArray(place.googleReviews)
    ? place.googleReviews
        .map((review) => {
          if (typeof review === "string") return review.trim();
          if (review && typeof review === "object" && typeof review.text === "string") {
            return review.text.trim();
          }
          return "";
        })
        .filter(Boolean)
    : [];

  // ─── DESCRIPTION ─────────────────────────────────────────────────────
  // Prefer the stored description. If none, use the first Reddit comment as a preview.
  // If there's nothing at all, show a placeholder.
  const rawDescription =
    place.description ||
    (place.comments && place.comments.length > 0
      ? `"${place.comments[0].text}"`
      : "No description yet.");
  const description = truncateText(rawDescription);

  // ─── SCORES ──────────────────────────────────────────────────────────
  // Round to whole numbers for clean display. Use null if data is missing
  // so we can render "—" instead of "0" (which could be misleading).
  const gemScore = place.ranking ? Math.round(place.ranking) : null;
  const sentimentPct = sentimentValue ? Math.round(sentimentValue * 100) : null;

  return (
    <>
      <BackBtn onClick={onBack} />

      {/* ── HERO SECTION ─────────────────────────────────────────────────
          Two-column layout: place info on the left, Gem Score callout on the right */}
      <div className="detail-hero fu">
        <div className="detail-hero-left">
          {/* Breadcrumb label showing which category this place belongs to */}
          <p className="detail-cat fu1">{label}</p>
          <h2 className="detail-name fu2">{place.name}</h2>

          {/* Type tags (e.g. "American", "Outdoor") */}
          {displayTypes.length > 0 && (
            <div className="detail-tag-row fu3">
              {displayTypes.map((type) => (
                <span key={type} className="detail-tag">{type}</span>
              ))}
            </div>
          )}

          <p className="detail-desc fu4">{description}</p>
        </div>

        {/* Gem Score — the main ranking metric, scored out of 75.
            The (i) tooltip explains how it's calculated so users aren't confused. */}
        <div className="detail-score-callout fu3">
          <span className="detail-score-label">
            Gem Score
            <span className="info-trigger" tabIndex="0" aria-label="How Gem Score is calculated">
              i
              <span className="info-tooltip">
                Calculated from Reddit engagement, sentiment analysis, and Google place quality signals.
              </span>
            </span>
          </span>
          <span className="detail-score-number">{gemScore ?? "—"}</span>
          <span className="detail-score-sub">out of 75</span>
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────────────────────────
          Four secondary metrics in a scannable row below the hero */}
      <div className="detail-stats-strip fu4">
        <div className="detail-stat">
          <span className="detail-stat-value">
            {sentimentPct != null ? `${sentimentPct}%` : "—"}
          </span>
          <span className="detail-stat-label">Positive Sentiment</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">{place.mentionCount ?? "—"}</span>
          <span className="detail-stat-label">Reddit Mentions</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">
            {place.rating ? `${place.rating.toFixed(1)} ★` : "—"}
          </span>
          <span className="detail-stat-label">Google Rating</span>
        </div>
        <div className="detail-stat-divider" />
        <div className="detail-stat">
          <span className="detail-stat-value">{place.reviewCount ?? "—"}</span>
          <span className="detail-stat-label">Google Reviews</span>
        </div>
      </div>
      <div className="detail-section-rule fu5" aria-hidden="true" />

      {/* ── MAP ──────────────────────────────────────────────────────────
          Embedded Google Maps iframe — address comes from the place object */}
      <div className="detail-map-wrap fu5">
        <div className="detail-section-header">
          <p className="comments-heading">Location</p>
        </div>
        <div className="detail-map-section">
          <PlaceMap place={place} />
        </div>
      </div>
      <div className="detail-section-rule" aria-hidden="true" />

      {/* ── REDDIT COMMENTS ──────────────────────────────────────────────
          Comments scraped from r/GNV. Links to the original Reddit thread if available. */}
      <div className="detail-comments-section">
        <div className="detail-section-header fu">
          <p className="comments-heading">What locals are saying on Reddit</p>
          {/* Only render the Reddit link if the place has one stored */}
          {place.link && place.link.length > 0 && (
            <a
              href={place.link[0]}
              target="_blank"
              rel="noopener noreferrer"  // security best practice for external links
              className="detail-link-btn"
            >
              ↗ View on Reddit
            </a>
          )}
        </div>

        {place.comments && place.comments.length > 0 ? (
          <div className="comments-list">
            {place.comments.map((c, i) => (
              // Stagger the fade-in animation using fu2–fu5 classes (capped at fu5)
              <div key={i} className={`comment-card fu${Math.min(i + 2, 5)}`}>
                <div className="comment-quote-mark">"</div>
                <div className="comment-body">
                  <span className="comment-text">{c.text}</span>
                  <span className="comment-source">Local Reddit mention • r/GNV</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="detail-empty">No comments yet</p>
        )}
      </div>

      {/* ── GOOGLE REVIEWS ───────────────────────────────────────────────
          Only rendered if the place has Google reviews stored.
          Shows the aggregate star rating next to the section heading. */}
      {googleReviews.length > 0 && (
        <>
          <div className="detail-section-rule" aria-hidden="true" />
          <div className="detail-comments-section">
            <div className="detail-section-header fu">
              <p className="comments-heading">Google Reviews</p>
              {/* Star rating badge — shows rating and total review count */}
              <div className="google-rating-badge">
                <span className="google-rating-star">★</span>
                <span className="google-rating-value">
                  {place.rating ? place.rating.toFixed(1) : '—'}
                </span>
                {place.reviewCount && (
                  <span className="google-rating-count">({place.reviewCount.toLocaleString()})</span>
                )}
              </div>
            </div>
            <div className="comments-list">
              {googleReviews.map((review, i) => (
                <div key={i} className={`comment-card fu${Math.min(i + 2, 5)}`}>
                  {/* "G" badge to visually distinguish Google reviews from Reddit comments */}
                  <div className="google-g-badge">G</div>
                  <div className="comment-body">
                    <span className="comment-text">{review}</span>
                    <span className="comment-source">Google Review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}