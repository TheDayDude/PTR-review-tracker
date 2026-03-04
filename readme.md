# PTR Review Tracker

A simple web page GUI you can host on GitHub Pages to keep an eye on interior review workload across these expansion pages:

- Salt and Spice
- Markarth
- Rihad
- Poison Song
- Scars of the Shadow

The page queries the Project Tamriel wiki API and counts mentions of:

- `Ready for Review`
- `R4R`
- `Pending Review`

## I just want a URL I can visit

Yes — after publishing with GitHub Pages, you use it like any normal website.

Your URL will be:

- `https://<your-github-username>.github.io/<repo-name>/`

Example:

- if your username is `alice` and your repo is `PTR-review-tracker`, open:
- `https://alice.github.io/PTR-review-tracker/`

## Quick publish steps (one-time setup)

1. Create a GitHub repo and push this code.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually in **Actions**).
5. Open the deployed Pages URL shown in the workflow run summary.

This repo includes `.github/workflows/deploy-pages.yml`, so deployment is automatic when you push to `main`.

## Day-to-day use

1. Open your GitHub Pages URL.
2. Click **Refresh now** whenever you want a fresh snapshot.
3. Keep auto-refresh on if you want it to update every 10 minutes.

## Run locally (optional)

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
