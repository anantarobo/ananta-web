import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicDir = path.join(root, 'public')

function loadEnv() {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
      }),
  )
}

const env = loadEnv()
const siteUrl = (env.VITE_SITE_URL || 'https://anantarobotics.com').replace(/\/$/, '')
const lastmod = new Date().toISOString().slice(0, 10)

const pages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/#about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/#results', changefreq: 'monthly', priority: '0.8' },
  { loc: '/#gallery', changefreq: 'monthly', priority: '0.7' },
  { loc: '/#video', changefreq: 'monthly', priority: '0.7' },
  { loc: '/#testimonials', changefreq: 'monthly', priority: '0.7' },
  { loc: '/#contact', changefreq: 'monthly', priority: '0.9' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots)

console.log(`SEO files generated for ${siteUrl}`)
