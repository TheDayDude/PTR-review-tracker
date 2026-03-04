#!/usr/bin/env python3
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

PROJECTS = [
    {
        "name": "Salt and Spice",
        "wikiTitle": "Salt_and_Spice_Expansion",
        "url": "https://wiki.project-tamriel.com/wiki/Salt_and_Spice_Expansion",
    },
    {
        "name": "Markarth",
        "wikiTitle": "Markarth_Expansion",
        "url": "https://wiki.project-tamriel.com/wiki/Markarth_Expansion",
    },
    {
        "name": "Rihad",
        "wikiTitle": "Rihad_Expansion",
        "url": "https://wiki.project-tamriel.com/wiki/Rihad_Expansion",
    },
    {
        "name": "Poison Song",
        "wikiTitle": "Poison_Song_Expansion",
        "url": "https://wiki.project-tamriel.com/wiki/Poison_Song_Expansion",
    },
    {
        "name": "Scars of the Shadow",
        "wikiTitle": "Scars_of_the_Shadow_Expansion",
        "url": "https://wiki.project-tamriel.com/wiki/Scars_of_the_Shadow_Expansion",
    },
]

REVIEW_REGEX = re.compile(r"\b(?:ready\s+for\s+review|r4r|pending\s+review)\b", re.IGNORECASE)


def fetch_wiki_source(title: str) -> str:
    params = urllib.parse.urlencode({"title": title, "action": "raw"})
    url = f"https://wiki.project-tamriel.com/index.php?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "PTR-Review-Tracker/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "")
        if "text" not in content_type and "wiki" not in content_type:
            raise RuntimeError(f"Unexpected content type: {content_type}")
        return response.read().decode("utf-8", errors="replace")


def main() -> None:
    results = []
    for project in PROJECTS:
        item = {**project}
        try:
            source = fetch_wiki_source(project["wikiTitle"])
            item["count"] = len(REVIEW_REGEX.findall(source))
        except (urllib.error.URLError, TimeoutError, RuntimeError) as exc:
            item["error"] = str(exc)
        results.append(item)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "projects": results,
    }

    with open("data/review-counts.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
