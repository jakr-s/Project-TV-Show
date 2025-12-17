let allEpisodes = [];
let allShows = [];
let isShowingSelected = false;
let dataLoaded = false;
let episodeCache = {}; // Cache episodes by show ID
let showsLoaded = false;
let selectedShowId = null;

function setup() {
  setupShowAllButton();
  showLoadingMessage();
  fetchShows();
}

/* Fetch Requests */

async function fetchShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allShows = await response.json();
    showsLoaded = true;
    setupShowSelector();
  } catch (error) {
    console.error("Error fetching shows:", error);
    hideLoadingMessage();
    showErrorMessage();
  }
}

async function fetchEpisodes(showId) {
  try {
    // Check if already cached
    if (episodeCache[showId]) {
      allEpisodes = episodeCache[showId];
      dataLoaded = true;
      hideLoadingMessage();
      hideErrorMessage();
      makePageForEpisodes(allEpisodes);
      clearSearch();
      setupSearch();
      setupEpisodeSelector();
      return;
    }

    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allEpisodes = await response.json();
    episodeCache[showId] = allEpisodes; // Cache the episodes
    dataLoaded = true;
    hideLoadingMessage();
    hideErrorMessage();
    makePageForEpisodes(allEpisodes);
    clearSearch();
    setupSearch();
    setupEpisodeSelector();
  } catch (error) {
    console.error("Error fetching episodes:", error);
    hideLoadingMessage();
    showErrorMessage();
  }
}

/* Show Selector */

function setupShowSelector() {
  const select = document.getElementById("show-select");

  // Sort shows alphabetically by name (case-insensitive)
  const sortedShows = [...allShows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.append(option);
  });

  select.addEventListener("change", handleShowSelect);
}

function handleShowSelect(event) {
  const selectedId = event.target.value;

  if (!selectedId) {
    // Reset
    return;
  }

  selectedShowId = parseInt(selectedId);
  showLoadingMessage();
  clearSearch();
  clearEpisodeSelector();
  fetchEpisodes(selectedShowId);
}

/* Page Creation */

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous episodes

  rootElem.append(...episodeList.map((episode) => episodeCard(episode)));

  updateEpisodeCount(episodeList.length);
}

function episodeCard({ name, image, season, number, summary }) {
  const template = document.getElementById("episode-Card");
  const card = template.content.cloneNode(true);

  const episodeCode = formatEpisodeCode(season, number);

  card.querySelector(".episode-title").textContent = `${name}-${episodeCode}`;

  const img = card.querySelector(".episode-img");
  img.src = image?.medium || "";
  img.alt = `Poster for '${name}'`;

  card.querySelector(".episode-summary").textContent =
    summary?.replace(/<[^>]+>/g, "") || "No summary available.";

  return card;
}

/* Search bar */

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", handleSearch);
}

function matchesSearch(episode, searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return (
    episode.name.toLowerCase().includes(lowerSearchTerm) ||
    episode.summary.toLowerCase().includes(lowerSearchTerm)
  );
}

function handleSearch(event) {
  const searchTerm = event.target.value;
  const filteredEpisodes = allEpisodes.filter((episode) =>
    matchesSearch(episode, searchTerm)
  );
  makePageForEpisodes(filteredEpisodes);
  isShowingSelected = false;
  document.getElementById("show-all-btn").style.display = "none";
  document.getElementById("episode-select").value = "";
}

function updateEpisodeCount(count) {
  const countElem = document.getElementById("episode-count");
  countElem.textContent = `Displaying ${count} / ${allEpisodes.length} episodes`;
}

/* Episode Select Dropdown */

function setupEpisodeSelector() {
  const select = document.getElementById("episode-select");

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    select.append(option);
  });

  select.addEventListener("change", handleEpisodeSelect);
}

function handleEpisodeSelect(event) {
  const selectedId = event.target.value;

  if (!selectedId) {
    // Reset
    showAllEpisodes();
    return;
  }

  const selectedEpisode = allEpisodes.find(
    (ep) => ep.id === parseInt(selectedId)
  );

  if (selectedEpisode) {
    makePageForEpisodes([selectedEpisode]); // Destructure single item
    isShowingSelected = true;
    document.getElementById("show-all-btn").style.display = "block";
  }
}

/* Show All Episodes Button */

function showAllEpisodes() {
  makePageForEpisodes(allEpisodes);
  isShowingSelected = false;
  document.getElementById("show-all-btn").style.display = "none";
  document.getElementById("episode-select").value = "";
  document.getElementById("search-input").value = "";
}

function setupShowAllButton() {
  const showAllBtn = document.getElementById("show-all-btn");
  showAllBtn.addEventListener("click", showAllEpisodes);
}

/* Helper Functions */

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function showLoadingMessage() {
  document.getElementById("loading-message").style.display = "block";
}

function hideLoadingMessage() {
  document.getElementById("loading-message").style.display = "none";
}

function showErrorMessage() {
  document.getElementById("error-message").style.display = "block";
}

function hideErrorMessage() {
  document.getElementById("error-message").style.display = "none";
}

function clearSearch() {
  document.getElementById("search-input").value = "";
}

function clearEpisodeSelector() {
  const select = document.getElementById("episode-select");
  // Clear all options except the first one
  while (select.options.length > 1) {
    select.remove(1);
  }
  select.value = "";
}

window.onload = setup;
