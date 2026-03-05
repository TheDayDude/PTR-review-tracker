# PTR Review Tracker (Simple Test)

This simplified test page shows one thing:

- number of `R4R` / `Pending Review` mentions per project

## Important behavior

- Counts are generated from **rendered wiki page text** using MediaWiki `action=parse`.
- If the updater cannot reach a project page, that project is set to `0` and listed in the status message.

## Publish and use

1. Push to GitHub.
2. Let the Pages workflow deploy.
3. Open:
   - `https://<your-github-username>.github.io/<repo-name>/`

## Snapshot format used by the page

```json
{
  "generatedAt": "...",
  "counts": {
    "Salt_and_Spice_Expansion": 0
  },
  "projects": [
    {
      "wikiTitle": "Salt_and_Spice_Expansion",
      "count": 0
    }
  ]
}
```

## Local run

```bash
python3 scripts/update_review_counts.py
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
