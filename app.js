const projects = [
  {
    name: "Salt and Spice",
    wikiTitle: "Salt_and_Spice_Expansion",
    url: "https://wiki.project-tamriel.com/wiki/Salt_and_Spice_Expansion",
  },
  {
    name: "Markarth",
    wikiTitle: "Markarth_Expansion",
    url: "https://wiki.project-tamriel.com/wiki/Markarth_Expansion",
  },
  {
    name: "Rihad",
    wikiTitle: "Rihad_Expansion",
    url: "https://wiki.project-tamriel.com/wiki/Rihad_Expansion",
  },
  {
    name: "Poison Song",
    wikiTitle: "Poison_Song_Expansion",
    url: "https://wiki.project-tamriel.com/wiki/Poison_Song_Expansion",
  },
  {
    name: "Scars of the Shadow",
    wikiTitle: "Scars_of_the_Shadow_Expansion",
    url: "https://wiki.project-tamriel.com/wiki/Scars_of_the_Shadow_Expansion",
  },
];

const reviewRegex = /\b(?:ready\s+for\s+review|r4r|pending\s+review)\b/gi;

const resultsBody = document.getElementById("resultsBody");
const refreshButton = document.getElementById("refreshButton");
const lastUpdated = document.getElementById("lastUpdated");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setLoadingState(isLoading) {
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Refreshing..." : "Refresh counts";
}

function buildApiUrl(title) {
  const query = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    titles: title,
    format: "json",
    formatversion: "2",
    origin: "*",
  });

  return `https://wiki.project-tamriel.com/api.php?${query.toString()}`;
}

async function fetchProjectCount(project) {
  const response = await fetch(buildApiUrl(project.wikiTitle));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format");
  }

  const matches = content.match(reviewRegex) ?? [];
  return {
    count: matches.length,
    sampleMatches: [...new Set(matches.map((m) => m.toLowerCase()))],
  };
}

function renderRows(rows) {
  resultsBody.innerHTML = rows
    .map((row) => {
      if (row.error) {
        return `<tr>
          <td><a href="${row.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.name)}</a></td>
          <td class="status-error">Error</td>
          <td>${escapeHtml(row.error)}</td>
        </tr>`;
      }

      const details = row.sampleMatches.length
        ? `Matched: ${row.sampleMatches.join(", ")}`
        : "No status keywords found.";

      return `<tr>
        <td><a href="${row.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.name)}</a></td>
        <td class="status-good">${row.count}</td>
        <td>${escapeHtml(details)}</td>
      </tr>`;
    })
    .join("");
}

async function refresh() {
  setLoadingState(true);

  const rows = await Promise.all(
    projects.map(async (project) => {
      try {
        const result = await fetchProjectCount(project);
        return { ...project, ...result };
      } catch (error) {
        return {
          ...project,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  renderRows(rows);
  lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
  setLoadingState(false);
}

refreshButton.addEventListener("click", refresh);
refresh();
