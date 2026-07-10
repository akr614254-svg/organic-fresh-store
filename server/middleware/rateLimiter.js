import rateLimit from 'express-rate-limit'

// Generous ceiling for normal browsing/shopping traffic — this exists to
// blunt scraping/abuse, not to get in a real customer's way.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down and try again shortly.' },
})

// Much tighter limit on login/register specifically, since these are the
// endpoints brute-force and signup-spam bots actually target.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts — please wait a few minutes before trying again.' },
})
