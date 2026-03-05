const projects = [
  { name: "Salt and Spice", wikiTitle: "Salt_and_Spice_Expansion", url: "https://wiki.project-tamriel.com/wiki/Salt_and_Spice_Expansion" },
  { name: "Markarth", wikiTitle: "Markarth_Expansion", url: "https://wiki.project-tamriel.com/wiki/Markarth_Expansion" },
  { name: "Rihad", wikiTitle: "Rihad_Expansion", url: "https://wiki.project-tamriel.com/wiki/Rihad_Expansion" },
  { name: "Poison Song", wikiTitle: "Poison_Song_Expansion", url: "https://wiki.project-tamriel.com/wiki/Poison_Song_Expansion" },
  { name: "Scars of the Shadow", wikiTitle: "Scars_of_the_Shadow_Expansion", url: "https://wiki.project-tamriel.com/wiki/Scars_of_the_Shadow_Expansion" },
];

const resultsBody = document.getElementById("resultsBody");
const refreshButton = document.getElementById("refreshButton");
const lastUpdated = document.getElementById("lastUpdated");
const statusText = document.getElementById("statusText");

function setLoadingState(isLoading) {
  if (!refreshButton) return;
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Refreshing..." : "Refresh";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseCounts(payload) {
  const countsByTitle = new Map();

  if (payload && typeof payload.counts === "object" && payload.counts !== null) {
    for (const [title, count] of Object.entries(payload.counts)) {
      countsByTitle.set(title, Number(count) || 0);
    }
    return countsByTitle;
  }

  const sourceRows = Array.isArray(payload?.projects) ? payload.projects : [];
  for (const row of sourceRows) {
    countsByTitle.set(row.wikiTitle, Number(row.count) || 0);
  }

  return countsByTitle;
}

function renderRows(rows) {
  if (!resultsBody) return;
  resultsBody.innerHTML = rows
    .map(
      (row) => `<tr>
        <td><a href="${row.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.name)}</a></td>
        <td class="status-good">${row.count}</td>
      </tr>`
    )
    .join("");
}

async function refresh() {
  setLoadingState(true);
  try {
    const response = await fetch(`./data/review-counts.json?t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const countsByTitle = parseCounts(payload);

    const rows = projects.map((project) => ({
      ...project,
      count: countsByTitle.get(project.wikiTitle) ?? 0,
    }));

    renderRows(rows);
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    statusText.textContent = "Simple test mode: showing count only.";
  } catch (error) {
    const rows = projects.map((project) => ({ ...project, count: 0 }));
    renderRows(rows);
    lastUpdated.textContent = "Last updated: unavailable";
    statusText.textContent = `Could not load snapshot; showing zeros. (${error instanceof Error ? error.message : "Unknown error"})`;
  } finally {
    setLoadingState(false);
  }
}

refreshButton?.addEventListener("click", refresh);
refresh();
