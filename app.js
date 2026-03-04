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
const autoRefreshMs = 10 * 60 * 1000;

const resultsBody = document.getElementById("resultsBody");
const cards = document.getElementById("cards");
const refreshButton = document.getElementById("refreshButton");
const autoRefreshToggle = document.getElementById("autoRefreshToggle");
const lastUpdated = document.getElementById("lastUpdated");
const totalMentions = document.getElementById("totalMentions");
const highestProject = document.getElementById("highestProject");
const healthyProjects = document.getElementById("healthyProjects");

let autoRefreshHandle = null;

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
  refreshButton.textContent = isLoading ? "Refreshing..." : "Refresh now";
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

  return {
    count: (content.match(reviewRegex) ?? []).length,
  };
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
          <p class="card-error">Could not fetch data: ${escapeHtml(row.error)}</p>
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

  rows.sort((a, b) => {
    if (a.error && b.error) return a.name.localeCompare(b.name);
    if (a.error) return 1;
    if (b.error) return -1;
    return b.count - a.count;
  });

  renderSummary(rows);
  renderCards(rows);
  renderTable(rows);
  lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
  setLoadingState(false);
}

refreshButton.addEventListener("click", refresh);
autoRefreshToggle.addEventListener("change", scheduleAutoRefresh);

scheduleAutoRefresh();
refresh();
