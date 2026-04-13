// PlaceMap.jsx — embeds a Google Maps iframe for a given place.
// Used in DetailPage to show the location without requiring a Maps API key.
//
// How it works: Google's public embed URL accepts a search query (`q=`) and
// returns a map centered on that location. We use the stored address if available,
// or fall back to "Place Name, Gainesville, FL" as the search string.

// Props:
//   place — the full place object; we only need `place.address` and `place.name`
export default function PlaceMap({ place }) {
  // Fall back to a name + city search if no address is stored in the DB
  const address = place.address || `${place.name}, Gainesville, FL`

  // z=15 sets the zoom level (15 is a good "neighborhood" zoom)
  // output=embed is required to get the embeddable version of the map
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`

  return (
    <div className="detail-map">
      <iframe
        className="map-frame"
        src={embedUrl}
        title={`Map of ${place.name}`}
        loading="lazy"              // defer loading until the iframe is near the viewport
        referrerPolicy="no-referrer-when-downgrade"  // required by Google Maps embed
      />

      {/* Decorative overlay — adds a subtle vignette/tint over the map for style */}
      <div className="map-overlay" aria-hidden="true" />

      {/* Address badge shown on top of the map so users can see/copy the address */}
      <div className="map-address-badge">{address}</div>
    </div>
  )
}