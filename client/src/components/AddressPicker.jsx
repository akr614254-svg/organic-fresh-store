import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [28.6139, 77.209] // New Delhi — just a sane default center

// A plain emoji pin as a divIcon — sidesteps Leaflet's default marker image
// paths, which break under Vite's bundling unless separately configured.
const pinIcon = L.divIcon({
  html: '<span style="font-size:28px;line-height:1;display:block;transform:translateY(2px)">📍</span>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

/**
 * Delivery address field for Checkout. Free autocomplete-style search via
 * OpenStreetMap's Nominatim API, plus a Leaflet map with a draggable pin so
 * the customer can fine-tune the exact drop location. No API key, no
 * billing account, no card required — see openstreetmap.org/copyright for
 * Nominatim's fair-use policy (we debounce searches to stay well within it).
 *
 * Calls onChange({ address, lat, lng }) whenever the address or pin moves.
 */
export default function AddressPicker({ value, onChange }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerInstance = useRef(null)
  const debounceRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [pin, setPin] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Set up the map + draggable marker once, on mount.
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    const map = L.map(mapRef.current, { zoomControl: true }).setView(DEFAULT_CENTER, 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)
    mapInstance.current = map

    const marker = L.marker(DEFAULT_CENTER, { draggable: true, icon: pinIcon }).addTo(map)
    markerInstance.current = marker

    // Dragging the pin is how the customer corrects the exact drop point
    // (e.g. "second gate, not the main one") after search gets them close.
    marker.on('dragend', async () => {
      const { lat, lng } = marker.getLatLng()
      setPin({ lat, lng })
      const address = await reverseGeocode(lat, lng)
      onChange({ address: address ?? value, lat, lng })
    })

    return () => {
      map.remove()
      mapInstance.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placePin(lat, lng, address) {
    const map = mapInstance.current
    const marker = markerInstance.current
    if (!map || !marker) return
    map.setView([lat, lng], 16)
    marker.setLatLng([lat, lng])
    setPin({ lat, lng })
    onChange({ address, lat, lng })
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      return data.display_name
    } catch {
      return null
    }
  }

  // Debounced free-text search — the 400ms debounce keeps us comfortably
  // under Nominatim's ~1 request/second fair-use limit.
  function handleInputChange(e) {
    const text = e.target.value
    onChange({ address: text, lat: pin?.lat ?? null, lng: pin?.lng ?? null })
    setShowSuggestions(true)

    clearTimeout(debounceRef.current)
    if (text.trim().length < 3) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(text)}&limit=5`,
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function selectSuggestion(item) {
    setSuggestions([])
    setShowSuggestions(false)
    placePin(parseFloat(item.lat), parseFloat(item.lon), item.display_name)
  }

  // Grabs the device's real GPS position — far more reliable than address
  // search in areas where OpenStreetMap's address data is thin. This is
  // what apps like Swiggy/Zomato lean on for exact drop pins in India.
  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location isn\u2019t supported on this device/browser.')
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const address = await reverseGeocode(latitude, longitude)
        placePin(latitude, longitude, address ?? value)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — allow it in your browser settings to use this.'
            : 'Couldn\u2019t get your location. Try again, or search/drag the pin instead.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className="sm:col-span-2 flex flex-col gap-2 relative">
      <input
        required
        placeholder="Start typing your address…"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
      />

      {showSuggestions && (searching || suggestions.length > 0) && (
        <ul className="absolute top-[52px] left-0 right-0 z-[1200] bg-white border border-forest/15 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {searching && <li className="px-4 py-2.5 text-sm text-charcoal/40">Searching…</li>}
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => selectSuggestion(s)}
              className="px-4 py-2.5 text-sm hover:bg-sprout/10 cursor-pointer border-t border-forest/5 first:border-t-0"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="self-start flex items-center gap-1.5 text-sm font-medium text-leaf hover:text-forest disabled:opacity-60 disabled:cursor-wait"
      >
        <span>📍</span>
        {locating ? 'Getting your location…' : 'Use my current location'}
      </button>

      {locationError && <p className="text-xs text-red-500">{locationError}</p>}

      <div ref={mapRef} className="w-full h-48 rounded-xl border border-forest/15 overflow-hidden" />
      <p className="text-xs text-charcoal/40">
        {pin ? 'Drag the pin to fine-tune your exact drop-off spot.' : 'Search your address above, or drag the pin on the map.'}
      </p>
    </div>
  )
}
