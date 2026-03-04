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

It then shows:

- total mentions
- highest workload project
- per-project cards with visual bars
- a sortable-at-a-glance table ordered by current workload

## Run locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set source to your main branch and root folder.
3. Visit your new `https://<user>.github.io/<repo>/` URL.
