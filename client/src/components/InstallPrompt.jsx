import { useEffect, useState } from 'react'

const DISMISS_KEY = 'of_install_prompt_dismissed_at'
const DISMISS_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000 // don't re-nag for a week after dismissal

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari's own flag
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function recentlyDismissed() {
  const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
  return Date.now() - at < DISMISS_SNOOZE_MS
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return

    // Chrome/Android/Edge fire this when the site qualifies as installable
    // (manifest + service worker present) — we intercept it so we can show
    // our own styled banner instead of the default mini-infobar.
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // iOS Safari never fires beforeinstallprompt — there's no native
    // trigger to hook, so just show manual "Add to Home Screen" steps
    // instead, once, if not already installed and not recently dismissed.
    if (isIOS() && !window.navigator.standalone) {
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setVisible(false)
      return
    }
    if (isIOS()) {
      setShowIOSInstructions(true)
    }
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
    setShowIOSInstructions(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1300] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-forest text-cream rounded-2xl shadow-lg px-5 py-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">🌱</span>
        <div className="flex-1 min-w-0">
          {!showIOSInstructions ? (
            <>
              <p className="text-sm font-medium">Install Organic Fresh</p>
              <p className="text-xs text-cream/70 mt-0.5">
                Add it to your home screen for quick, app-like access.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="bg-cream text-forest text-xs font-medium px-4 py-2 rounded-full hover:bg-sprout transition-colors"
                >
                  Install
                </button>
                <button onClick={dismiss} className="text-xs text-cream/60 hover:text-cream">
                  Not now
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Add to Home Screen</p>
              <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                Tap the Share icon <span className="inline-block">⎋</span> in Safari's toolbar, then choose
                <span className="font-medium"> "Add to Home Screen"</span>.
              </p>
              <button onClick={dismiss} className="text-xs text-cream/60 hover:text-cream mt-3">
                Got it
              </button>
            </>
          )}
        </div>
        <button onClick={dismiss} className="text-cream/40 hover:text-cream text-xs shrink-0" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  )
}
