# PTR Review Tracker

A simple web page GUI you can host on GitHub Pages to keep an eye on interior review workload across these expansion pages:

- Salt and Spice
- Markarth
- Rihad
- Poison Song
- Scars of the Shadow

## Why this now works on GitHub Pages

The browser no longer calls the wiki API directly (which caused `Failed to fetch` CORS/network issues).

Instead:

1. A GitHub Action fetches wiki page source server-side.
2. It writes `data/review-counts.json`.
3. Your static page reads that local JSON file.

This works reliably on GitHub Pages because the page only fetches same-origin files.

## Your URL

- `https://<your-github-username>.github.io/<repo-name>/`

## Update frequency

- The deploy workflow runs on push and every 30 minutes via cron.
- The page auto-refreshes every 10 minutes, and manual refresh reloads the latest snapshot file.

## Run locally

```bash
python3 scripts/update_review_counts.py
python3 -m http.server 8000
```

Open <http://localhost:8000>.
