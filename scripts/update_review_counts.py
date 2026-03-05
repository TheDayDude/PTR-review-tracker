#!/usr/bin/env python3
import html
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
TAG_REGEX = re.compile(r"<[^>]+>")
REQUEST_HEADERS = {"User-Agent": "PTR-Review-Tracker/1.0"}
NO_PROXY_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def open_url(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with NO_PROXY_OPENER.open(req, timeout=timeout) as response:
        return response.read()


def fetch_rendered_page_text(title: str) -> str:
    params = urllib.parse.urlencode(
        {
            "action": "parse",
            "page": title,
            "prop": "text",
            "format": "json",
            "formatversion": "2",
        }
    )
    url = f"https://wiki.project-tamriel.com/api.php?{params}"
    payload = json.loads(open_url(url).decode("utf-8", errors="replace"))
    html_text = payload.get("parse", {}).get("text")
    if not isinstance(html_text, str):
        raise RuntimeError("Unexpected parse API response format")

    plain = TAG_REGEX.sub(" ", html_text)
    plain = html.unescape(plain)
    return re.sub(r"\s+", " ", plain)


def main() -> None:
    results = []
    counts = {}

    for project in PROJECTS:
        item = {**project}
        try:
            page_text = fetch_rendered_page_text(project["wikiTitle"])
            count = len(REVIEW_REGEX.findall(page_text))
            item["count"] = count
            counts[project["wikiTitle"]] = count
        except (urllib.error.URLError, TimeoutError, RuntimeError, OSError, json.JSONDecodeError) as exc:
            item["error"] = f"Fetch failed: {exc}"
            counts[project["wikiTitle"]] = 0
        results.append(item)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "counts": counts,
        "projects": results,
    }

    with open("data/review-counts.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
