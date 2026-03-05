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
REQUEST_HEADERS = {"User-Agent": "PTR-Review-Tracker/1.0"}

# Explicitly disable env proxy usage (HTTP[S]_PROXY), which can cause
# "Tunnel connection failed: 403 Forbidden" in some runners.
NO_PROXY_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def open_url(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with NO_PROXY_OPENER.open(req, timeout=timeout) as response:
        return response.read()


def fetch_wiki_source_raw(title: str) -> str:
    params = urllib.parse.urlencode({"title": title, "action": "raw"})
    url = f"https://wiki.project-tamriel.com/index.php?{params}"
    data = open_url(url)
    return data.decode("utf-8", errors="replace")


def fetch_wiki_source_api(title: str) -> str:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "prop": "revisions",
            "rvprop": "content",
            "rvslots": "main",
            "titles": title,
            "format": "json",
            "formatversion": "2",
        }
    )
    url = f"https://wiki.project-tamriel.com/api.php?{params}"
    payload = json.loads(open_url(url).decode("utf-8", errors="replace"))
    content = payload.get("query", {}).get("pages", [{}])[0].get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("content")
    if not isinstance(content, str):
        raise RuntimeError("Unexpected MediaWiki API response format")
    return content


def fetch_wiki_source(title: str) -> str:
    try:
        return fetch_wiki_source_raw(title)
    except Exception:
        # fallback endpoint in case ?action=raw is blocked upstream
        return fetch_wiki_source_api(title)


def main() -> None:
    results = []
    for project in PROJECTS:
        item = {**project}
        try:
            source = fetch_wiki_source(project["wikiTitle"])
            item["count"] = len(REVIEW_REGEX.findall(source))
        except (urllib.error.URLError, TimeoutError, RuntimeError, OSError, json.JSONDecodeError) as exc:
            item["error"] = f"Fetch failed: {exc}"
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
