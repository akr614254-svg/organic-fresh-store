import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Organic Fresh's dispatch point — Tumakuru, Karnataka. In a real fleet
// this would come from a warehouse/dark-store record; hardcoded here since
// there's only one.
const STORE_ORIGIN = { lat: 13.3379, lng: 77.1173 }

// There's no real courier GPS feed wired up yet, so this simulates a
// straight-line delivery over a fixed duration once an order goes
// "out_for_delivery" — clearly labeled as an estimate, not a live GPS
// position. Swapping this for a real feed later just means replacing
// `interpolatePosition` with whatever the driver app reports.
const SIMULATED_DELIVERY_MINUTES = 20

function makeIcon(emoji, size = 28) {
  return L.divIcon({
    html: `<span style="font-size:${size}px;line-height:1;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))">${emoji}</span>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const storeIcon = makeIcon('🏬', 26)
const homeIcon = makeIcon('📍', 26)
const scooterIcon = makeIcon('🛵', 30)

function interpolatePosition(origin, dest, fraction) {
  return {
    lat: origin.lat + (dest.lat - origin.lat) * fraction,
    lng: origin.lng + (dest.lng - origin.lng) * fraction,
  }
}

export default function LiveTrackingMap({ order }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const scooterMarker = useRef(null)
  const [fraction, setFraction] = useState(0)

  const dest = order.deliveryAddress
  const hasCoords = typeof dest?.lat === 'number' && typeof dest?.lng === 'number'
  const startedAt = order.outForDeliveryAt ? new Date(order.outForDeliveryAt).getTime() : null

  // Recompute how far along the simulated route we are every few seconds.
  useEffect(() => {
    if (!startedAt) return
    const tick = () => {
      const elapsedMs = Date.now() - startedAt
      const f = Math.min(1, Math.max(0, elapsedMs / (SIMULATED_DELIVERY_MINUTES * 60 * 1000)))
      setFraction(f)
    }
    tick()
    const id = setInterval(tick, 5000)
    return () => clearInterval(id)
  }, [startedAt])

  // Set up the map once.
  useEffect(() => {
    if (!hasCoords || mapInstance.current || !mapRef.current) return

    const map = L.map(mapRef.current, { zoomControl: false, dragging: true, scrollWheelZoom: false })
      .fitBounds([[STORE_ORIGIN.lat, STORE_ORIGIN.lng], [dest.lat, dest.lng]], { padding: [30, 30] })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.marker([STORE_ORIGIN.lat, STORE_ORIGIN.lng], { icon: storeIcon }).addTo(map)
    L.marker([dest.lat, dest.lng], { icon: homeIcon }).addTo(map)
    L.polyline(
      [[STORE_ORIGIN.lat, STORE_ORIGIN.lng], [dest.lat, dest.lng]],
      { color: '#40916C', weight: 3, dashArray: '6 8' }
    ).addTo(map)

    scooterMarker.current = L.marker([STORE_ORIGIN.lat, STORE_ORIGIN.lng], { icon: scooterIcon }).addTo(map)
    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords])

  // Move the scooter marker whenever the simulated fraction updates.
  useEffect(() => {
    if (!hasCoords || !scooterMarker.current) return
    const pos = interpolatePosition(STORE_ORIGIN, dest, fraction)
    scooterMarker.current.setLatLng([pos.lat, pos.lng])
  }, [fraction, hasCoords, dest])

  if (!hasCoords) {
    return (
      <div className="bg-cream/60 border border-forest/10 rounded-xl px-4 py-3 text-xs text-charcoal/50">
        Live tracking isn't available for this order — it was placed without a map pin location.
      </div>
    )
  }

  const remainingMin = Math.max(0, Math.ceil((1 - fraction) * SIMULATED_DELIVERY_MINUTES))

  return (
    <div className="rounded-xl overflow-hidden border border-forest/10">
      <div ref={mapRef} className="w-full h-48" />
      <div className="bg-cream/60 px-4 py-2 flex items-center justify-between text-xs">
        <span className="text-charcoal/60">
          🛵 {fraction >= 1 ? 'Arriving any moment' : `~${remainingMin} min away`}
        </span>
        <span className="text-charcoal/30">Estimated route</span>
      </div>
    </div>
  )
}
