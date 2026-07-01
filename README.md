# Ananta Robotics Website

React + Vite one-page site for ANANTA ROBOTICS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add to `.env`:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/xxxxx/exec
VITE_SITE_URL=https://your-domain.com
```

## SEO

- Meta tags, Open Graph, Twitter cards, and JSON-LD in `src/components/Seo.jsx`
- `public/robots.txt` and `public/sitemap.xml` are generated from `VITE_SITE_URL`
- Regenerate anytime: `npm run seo`

## Contact form → Google Sheet

1. Open sheet → **Extensions → Apps Script**
2. Paste `google-apps-script/Code.gs` → Save → Deploy as Web app (Anyone)
3. Add URL to `.env`:
   ```
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/xxxxx/exec
   ```

## Build

```bash
npm run build
```

Upload `dist/` to your hosting.
