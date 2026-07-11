import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

// GET /sitemap.xml — regenerated on every request from the live product
// catalog, so newly added produce shows up for crawlers without a manual
// rebuild step. Mounted directly on the app (not under /api) in server.js.
router.get('/sitemap.xml', async (req, res) => {
  const siteUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]
  const products = await Product.find({ isActive: true }).select('legacyId updatedAt')

  const staticRoutes = ['', '/shop', '/about', '/contact']
  const urls = [
    ...staticRoutes.map((path) => `<url><loc>${siteUrl}${path}</loc><changefreq>daily</changefreq></url>`),
    ...products.map(
      (p) =>
        `<url><loc>${siteUrl}/product/${p.legacyId}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq></url>`
    ),
  ]

  res.set('Content-Type', 'application/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`)
})

export default router
