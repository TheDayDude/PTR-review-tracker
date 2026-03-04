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

const autoRefreshMs = 10 * 60 * 1000;

const resultsBody = document.getElementById("resultsBody");
const cards = document.getElementById("cards");
const refreshButton = document.getElementById("refreshButton");
const autoRefreshToggle = document.getElementById("autoRefreshToggle");
const lastUpdated = document.getElementById("lastUpdated");
const totalMentions = document.getElementById("totalMentions");
const highestProject = document.getElementById("highestProject");
const healthyProjects = document.getElementById("healthyProjects");
const dataSourceStatus = document.getElementById("dataSourceStatus");

let autoRefreshHandle = null;

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setLoadingState(isLoading) {
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Refreshing..." : "Refresh now";
}

function normalizeErrorMessage(message) {
  if (!message) return "Unknown error";
  const text = String(message);
  if (text.toLowerCase().includes("jsonp script failed to load")) {
    return "Old JSONP build is still cached. Hard refresh (Ctrl/Cmd+Shift+R) and redeploy latest commit.";
  }
  return text;
}

async function loadSnapshot() {
  const response = await fetch(`./data/review-counts.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Snapshot unavailable (HTTP ${response.status})`);
  }

  const payload = await response.json();
  const sourceRows = Array.isArray(payload?.projects) ? payload.projects : [];
  const byTitle = new Map(sourceRows.map((row) => [row.wikiTitle, row]));

  const rows = projects.map((project) => {
    const snapshotRow = byTitle.get(project.wikiTitle);
    if (!snapshotRow) {
      return { ...project, error: "No snapshot entry" };
    }

    if (snapshotRow.error) {
      return { ...project, error: normalizeErrorMessage(snapshotRow.error) };
    }

    return {
      ...project,
      count: Number.isFinite(snapshotRow.count) ? snapshotRow.count : Number(snapshotRow.count) || 0,
    };
  });

  return { rows, generatedAt: payload?.generatedAt ?? null };
}

function renderSummary(rows) {
  const healthy = rows.filter((row) => !row.error);
  const total = healthy.reduce((sum, row) => sum + row.count, 0);
  const highest = healthy.length
    ? healthy.reduce((current, row) => (row.count > current.count ? row : current), healthy[0])
    : null;

  totalMentions.textContent = String(total);
  highestProject.textContent = highest ? `${highest.name} (${highest.count})` : "No data";
  healthyProjects.textContent = `${healthy.length}/${projects.length}`;
}

function renderCards(rows) {
  const maxCount = Math.max(1, ...rows.filter((row) => !row.error).map((row) => row.count));

  cards.innerHTML = rows
    .map((row) => {
      if (row.error) {
        return `<article class="project-card error-card">
          <h3>${escapeHtml(row.name)}</h3>
          <p class="card-error">Could not load snapshot: ${escapeHtml(row.error)}</p>
          <p><a href="${row.url}" target="_blank" rel="noopener noreferrer">Open wiki page</a></p>
        </article>`;
      }

      const percent = Math.round((row.count / maxCount) * 100);
      return `<article class="project-card">
          <h3>${escapeHtml(row.name)}</h3>
          <p class="count">${row.count} mentions</p>
          <div class="bar-wrap" aria-hidden="true"><div class="bar" style="width:${percent}%"></div></div>
          <p class="card-link"><a href="${row.url}" target="_blank" rel="noopener noreferrer">Open wiki page</a></p>
        </article>`;
    })
    .join("");
}

function renderTable(rows) {
  const healthy = rows.filter((row) => !row.error);
  const total = healthy.reduce((sum, row) => sum + row.count, 0);

  resultsBody.innerHTML = rows
    .map((row) => {
      if (row.error) {
        return `<tr>
          <td><a href="${row.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.name)}</a></td>
          <td class="status-error">Error</td>
          <td>—</td>
          <td>${escapeHtml(row.error)}</td>
        </tr>`;
      }

      const share = total > 0 ? `${((row.count / total) * 100).toFixed(1)}%` : "0%";
      const status = row.count === 0 ? "No review keywords found" : "OK";

      return `<tr>
        <td><a href="${row.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.name)}</a></td>
        <td class="status-good">${row.count}</td>
        <td>${share}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
}

function scheduleAutoRefresh() {
  if (autoRefreshHandle) {
    clearInterval(autoRefreshHandle);
    autoRefreshHandle = null;
  }

  if (autoRefreshToggle.checked) {
    autoRefreshHandle = setInterval(refresh, autoRefreshMs);
  }
}

async function refresh() {
  setLoadingState(true);

  try {
    const { rows, generatedAt } = await loadSnapshot();

    rows.sort((a, b) => {
      if (a.error && b.error) return a.name.localeCompare(b.name);
      if (a.error) return 1;
      if (b.error) return -1;
      return b.count - a.count;
    });

    renderSummary(rows);
    renderCards(rows);
    renderTable(rows);

    const generated = generatedAt ? new Date(generatedAt).toLocaleString() : "unknown";
    lastUpdated.textContent = `Snapshot generated: ${generated}`;
    dataSourceStatus.textContent = "Data source: local snapshot file (data/review-counts.json).";
  } catch (error) {
    const message = normalizeErrorMessage(error instanceof Error ? error.message : "Unknown error");
    const rows = projects.map((project) => ({ ...project, error: message }));
    renderSummary(rows);
    renderCards(rows);
    renderTable(rows);
    lastUpdated.textContent = "Snapshot unavailable";
    dataSourceStatus.textContent = "Data source: unavailable. Check GitHub Pages deployment workflow logs.";
  } finally {
    setLoadingState(false);
  }
}

refreshButton.addEventListener("click", refresh);
autoRefreshToggle.addEventListener("change", scheduleAutoRefresh);

scheduleAutoRefresh();
refresh();
