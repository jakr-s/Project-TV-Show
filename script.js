let allEpisodes = [];
let allShows = [];
let isShowingSelected = false;
let dataLoaded = false;
let episodeCache = {}; // Cache episodes by show ID
let showsLoaded = false;
let selectedShowId = null;

function setup() {
  setupShowAllButton();
  setupBackButton();
  setupShowSearch();
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
    // Sort shows alphabetically by name (case-insensitive)
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    showsLoaded = true;
    setupShowSelector();
    makePageForShows(allShows);
    hideLoadingMessage();
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
      setupEpisodeSearch();
      setupEpisodeSelector();
      switchToEpisodeView();
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
    setupEpisodeSearch();
    setupEpisodeSelector();
    switchToEpisodeView();
  } catch (error) {
    console.error("Error fetching episodes:", error);
    hideLoadingMessage();
    showErrorMessage();
  }
}

/* Show Selector */

function setupShowSelector() {
  const select = document.getElementById("show-select");

  allShows.forEach((show) => {
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
    // Reset to show listing
    switchToShowView();
    return;
  }

  selectedShowId = parseInt(selectedId);
  showLoadingMessage();
  clearSearch();
  clearEpisodeSelector();
  fetchEpisodes(selectedShowId);
}

/* Episode Page Creation */

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

/* Shows Page Creation */

function makePageForShows(showsList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous shows

  rootElem.append(...showsList.map((show) => showCard(show)));

  updateShowCount(showsList.length);
}

function showCard(show) {
  const template = document.getElementById("show-Card");
  const card = template.content.cloneNode(true);

  const title = card.querySelector(".show-title");
  title.textContent = show.name;
  title.addEventListener("click", () => {
    handleShowSelect({ target: { value: show.id } });
    // Also update the dropdown to match
    document.getElementById("show-select").value = show.id;
  });
  title.style.cursor = "pointer"; // Make it look clickable

  const img = card.querySelector(".show-img");
  img.src = show.image?.medium || "";
  img.alt = `Poster for '${show.name}'`;

  card.querySelector(".show-summary").innerHTML =
    show.summary || "No summary available.";

  card.querySelector(".show-genres").textContent = (show.genres || []).join(
    ", "
  );
  card.querySelector(".show-status").textContent = show.status || "Unknown";
  card.querySelector(".show-rating").textContent =
    show.rating?.average || "N/A";
  card.querySelector(".show-runtime").textContent =
    `${show.runtime || "N/A"} min`;

  return card;
}

function updateShowCount(count) {
  const countElem = document.getElementById("show-count");
  if (countElem) {
    countElem.textContent = `Found ${count} shows`;
  }
}

/* Shows Search bar */

function setupShowSearch() {
  const searchInput = document.getElementById("show-search-input");
  searchInput.addEventListener("input", handleShowSearch);
}

function handleShowSearch(event) {
  const searchTerm = event.target.value;
  const filteredShows = allShows.filter((show) =>
    matchesShow(show, searchTerm)
  );
  makePageForShows(filteredShows);
}

function matchesShow(show, searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const name = show.name ? show.name.toLowerCase() : "";
  const summary = show.summary ? show.summary.toLowerCase() : "";
  const genres = show.genres || [];

  return (
    name.includes(lowerSearchTerm) ||
    summary.includes(lowerSearchTerm) ||
    genres.some((genre) => genre.toLowerCase().includes(lowerSearchTerm))
  );
}

/* Episode Search Bar */

function setupEpisodeSearch() {
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
  document.getElementById("modal-backdrop").style.display = "block";
  document.getElementById("loading-message").style.display = "block";
}

function hideLoadingMessage() {
  document.getElementById("modal-backdrop").style.display = "none";
  document.getElementById("loading-message").style.display = "none";
}

function showErrorMessage() {
  document.getElementById("modal-backdrop").style.display = "block";
  document.getElementById("error-message").style.display = "block";
}

function hideErrorMessage() {
  document.getElementById("modal-backdrop").style.display = "none";
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

/* View Management */

function switchToEpisodeView() {
  document.getElementById("show-controls").style.display = "none";
  document.getElementById("episode-controls").style.display = "block";
}

function switchToShowView() {
  document.getElementById("episode-controls").style.display = "none";
  document.getElementById("show-controls").style.display = "block";
  makePageForShows(allShows);
  // Reset show search
  document.getElementById("show-search-input").value = "";
  updateShowCount(allShows.length);
}

function setupBackButton() {
  document.getElementById("back-to-shows").addEventListener("click", () => {
    switchToShowView();
    // Clear selected show in dropdown
    document.getElementById("show-select").value = "";
  });
}

window.onload = setup;
