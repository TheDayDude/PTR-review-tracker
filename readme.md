# PTR Review Tracker

A simple web page GUI you can host on GitHub Pages to keep an eye on interior review workload across these expansion pages:

- Salt and Spice
- Markarth
- Rihad
- Poison Song
- Scars of the Shadow

## Why this works on GitHub Pages

The browser does **not** call the wiki API directly.

Instead:

1. A GitHub Action fetches wiki page source server-side.
2. It writes `data/review-counts.json`.
3. Your static page reads that same-origin JSON file.

This avoids browser CORS/network issues.

## Your URL

- `https://<your-github-username>.github.io/<repo-name>/`

## Update frequency

- The deploy workflow runs on push (`main` or `master`) and every 30 minutes via cron.
- The page auto-refreshes every 10 minutes, and manual refresh reloads the latest snapshot file.

## Troubleshooting

If you still see errors like `JSONP script failed to load`, you're likely seeing an older cached build.

1. Confirm GitHub Pages source is **GitHub Actions**.
2. Re-run the **Deploy static site to GitHub Pages** workflow.
3. Hard refresh the page (`Ctrl+Shift+R` or `Cmd+Shift+R`).
4. Verify the page shows `Data source: local snapshot file` under the toolbar.

## Run locally

```bash
python3 scripts/update_review_counts.py
python3 -m http.server 8000
```

Open <http://localhost:8000>.
