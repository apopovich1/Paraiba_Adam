import BackBtn from '../components/BackBtn'
import PlaceMap from '../components/PlaceMap'

export default function DetailPage({ place, label, onBack }) {
  return (
    <>
      <BackBtn onClick={onBack} />
      <p className="detail-breadcrumb fu">{label} / {place.name}</p>
      <div className="detail-card fu1">
        <PlaceMap place={place} />
        <div className="detail-body">
          <p className="detail-cat">{label}</p>
          <h2 className="detail-name">{place.name}</h2>
          <p className="detail-desc">{place.description}</p>
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">Reddit Mentions</span>
              <span className="meta-value">{place.mentionCount ? `${place.mentionCount} mentions` : "N/A"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Google Rating</span>
              <span className="meta-value">{place.rating ? `${place.rating} / 5` : "N/A"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">GoogleReviews</span>
              <span className="meta-value">{place.reviewCount ? `${place.reviewCount} reviews` : "N/A"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Gem Score</span>
              <span className="meta-value">{place.ranking ? `${Math.round(place.ranking)} / 100` : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="comments-heading fu2">What locals are saying</p>
      {place.comments && place.comments.length > 0 ? (
        place.comments.map((c, i) => (
          <div key={i} className={`comment-card fu${Math.min(i + 2, 5)}`}>
            <div className="comment-body">
              <span className="comment-text">"{c.text}"</span>
              <span className="comment-source">r/GNV</span>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>No comments yet</p>
      )}
      {place.link && place.link.length > 0 && (
        <a
          href={place.link[0]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12px', color: '#2ec4b6', fontWeight: 600,
            textDecoration: 'none', alignSelf: 'flex-start',
            marginTop: '8px', letterSpacing: '0.04em'
          }}
        >
          ↗ View on Reddit
        </a>
      )}
    </>
  )
}
