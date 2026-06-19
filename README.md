# Ananta Robotics Website

React + Vite one-page site for ANANTA ROBOTICS.

## Setup

```bash
npm install
cp .env.example .env   # add your Apps Script URL
npm run dev
```

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
