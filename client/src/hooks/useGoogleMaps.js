import { useEffect, useState } from 'react'

let loadPromise = null

// Loads the Google Maps JS API (with the Places library) exactly once,
// no matter how many components call this. Returns a promise that
// resolves once `window.google.maps` is ready to use.
function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return loadPromise
}

// Returns { google, loading, error } — components render a plain text
// fallback while loading/erroring so checkout never gets blocked by Maps.
export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [google, setGoogle] = useState(window.google || null)
  const [error, setError] = useState(apiKey ? null : 'Google Maps API key not configured')

  useEffect(() => {
    if (!apiKey || google) return
    let cancelled = false

    loadGoogleMaps(apiKey)
      .then((g) => !cancelled && setGoogle(g))
      .catch((err) => !cancelled && setError(err.message))

    return () => {
      cancelled = true
    }
  }, [apiKey, google])

  return { google, loading: !google && !error, error }
}
