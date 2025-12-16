let allEpisodes = [];
let isShowingSelected = false;

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
  setupShowAllButton();
}

/* Page Creation */

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous episodes

  episodeList.forEach((episode) => {
    const cardElem = episodeCard(episode);
    rootElem.append(cardElem);
  });

  updateEpisodeCount(episodeList.length);
}

function episodeCard({ name, image, season, number, summary }) {
  const template = document.getElementById("episode-Card");
  const card = template.content.cloneNode(true);

  const episodeCode = formatEpisodeCode(season, number);

  card.querySelector(".episode-title").textContent = `${name}-${episodeCode}`;

  const img = card.querySelector(".episode-img");
  img.src = image.medium;
  img.alt = name;

  card.querySelector(".episode-summary").innerHTML = summary;
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

window.onload = setup;
