import { useEffect } from 'react'

// A tiny stand-in for react-helmet-async — that package's peer deps only
// go up to React 18, which breaks `npm install` under React 19's strict
// peer resolution (see the ERESOLVE build failure this replaced). All we
// actually needed was to set the title and one meta tag per page, so a
// plain effect does the job with zero dependency risk.
export default function Seo({ title, description }) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    let meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content') ?? null
    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    // Restore whatever the previous page had set, so navigating back
    // doesn't leave a stale title/description behind.
    return () => {
      document.title = prevTitle
      if (meta && prevDescription !== null) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])

  return null
}
