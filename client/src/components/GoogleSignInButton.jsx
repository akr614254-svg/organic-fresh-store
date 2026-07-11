import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Renders Google's own "Sign in with Google" button via the Google
// Identity Services script tag loaded in index.html. Silently renders
// nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the rest of the
// login/signup page works fine without it.
export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth()
  const buttonRef = useRef(null)
  const [available, setAvailable] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return

    let cancelled = false

    // The GSI script loads async — poll briefly for window.google to exist
    // rather than assuming it's ready the instant this component mounts.
    const tryInit = () => {
      if (cancelled) return
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 150)
        return
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential)
            window.location.reload() // simplest way to re-run any redirect logic on Login/Signup
          } catch (err) {
            onError?.(err.message)
          }
        },
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          shape: 'pill',
        })
      }
      setAvailable(true)
    }
    tryInit()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  if (!clientId) return null

  return (
    <div className="flex flex-col items-center gap-3 my-2">
      <div className="flex items-center gap-3 w-full text-xs text-charcoal/40">
        <div className="flex-1 h-px bg-forest/10" />
        or
        <div className="flex-1 h-px bg-forest/10" />
      </div>
      <div ref={buttonRef} className={available ? '' : 'opacity-0 h-0 overflow-hidden'} />
    </div>
  )
}
