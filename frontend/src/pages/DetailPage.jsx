import BackBtn from "../components/BackBtn";
import PlaceMap from "../components/PlaceMap";

export default function DetailPage({ place, label, onBack }) {
  const rawTypes = Array.isArray(place.categoryType)
    ? place.categoryType
    : typeof place.categoryType === "string"
    ? place.categoryType.split(",")
    : [];

  const displayTypes = rawTypes
    .map((type) => String(type).trim())
    .filter(Boolean)
    .filter((type) => type.toLowerCase() !== "general")
    .slice(0, 4)
    .map((type) =>
      type
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );

  const sentimentValue = place.sentimentRating ?? place.sentimentrating;
  const description =
    place.description ||
    (place.comments && place.comments.length > 0 ? `"${place.comments[0].text}"` : "No description yet.");

  return (
    <>
      <BackBtn onClick={onBack} />
      <p className="detail-breadcrumb fu">
        {label} / {place.name}
      </p>
      <div className="detail-card detail-hero fu1">
        <div className="detail-body">
          <div className="detail-intro">
            <p className="detail-cat">{label}</p>
            <h2 className="detail-name">{place.name}</h2>
            <p className="detail-desc">{description}</p>
            {displayTypes.length > 0 && (
              <div className="detail-tag-row">
                {displayTypes.map((type) => (
                  <span key={type} className="detail-tag">
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="detail-meta-grid">
            <div className="meta-item highlight">
              <span className="meta-label with-info">
                Gem Score
                <span className="info-trigger" tabIndex="0" aria-label="How Gem Score is calculated">
                  i
                  <span className="info-tooltip">
                    Calculated from Reddit engagement, sentiment analysis, and Google place quality signals.
                  </span>
                </span>
              </span>
              <span className="meta-value large">
                {place.ranking ? `${Math.round(place.ranking)} / 100` : "N/A"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Sentiment</span>
              <span className="meta-value">
                {sentimentValue ? `${Math.round(sentimentValue * 100)}% positive` : "N/A"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Reddit Mentions</span>
              <span className="meta-value">
                {place.mentionCount ? `${place.mentionCount} mentions` : "N/A"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Address</span>
              <span className="meta-value small">{place.address || "Gainesville, FL"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Google Reviews</span>
              <span className="meta-value">
                {place.reviewCount ? `${place.reviewCount} reviews` : "N/A"}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Google Rating</span>
              <span className="meta-value">
                {place.rating ? `${place.rating.toFixed(1)} / 5` : "N/A"}
              </span>
            </div>
          </div>
        </div>
        <PlaceMap place={place} />
      </div>
      <div className="detail-section-header fu2">
        <p className="comments-heading">What locals are saying on reddit</p>
        {place.link && place.link.length > 0 && (
          <a
            href={place.link[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-link-btn"
          >
            ↗ View on Reddit
          </a>
        )}
      </div>
      {place.comments && place.comments.length > 0 ? (
        <div className="comments-list">
          {place.comments.map((c, i) => (
            <div key={i} className={`comment-card fu${Math.min(i + 2, 5)}`}>
              <div className="comment-quote-mark">“</div>
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
    </>
  );
}
