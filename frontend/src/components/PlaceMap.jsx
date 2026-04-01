export default function PlaceMap({ place }) {
  const address = place.address || `${place.name}, Gainesville, FL`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`

  return (
    <div className="detail-map">
      <iframe
        className="map-frame"
        src={embedUrl}
        title={`Map of ${place.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="map-address-badge">{address}</div>
    </div>
  )
}
