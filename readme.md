# PTR Review Tracker (Simple Test)

This simplified test page only shows one thing:

- number of `R4R` / `Pending Review` mentions per project

## What changed

- No complex cards/charts in this mode.
- If snapshot loading fails, the page shows `0` for all projects instead of noisy fetch errors.
- Data comes from `data/review-counts.json`.

## Publish and use

1. Push to GitHub.
2. Let the Pages workflow deploy.
3. Open:
   - `https://<your-github-username>.github.io/<repo-name>/`

## Snapshot format used by the page

```json
{
  "generatedAt": "2026-03-05T00:00:00Z",
  "counts": {
    "Salt_and_Spice_Expansion": 0,
    "Markarth_Expansion": 0,
    "Rihad_Expansion": 0,
    "Poison_Song_Expansion": 0,
    "Scars_of_the_Shadow_Expansion": 0
  }
}
```

## Local run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
