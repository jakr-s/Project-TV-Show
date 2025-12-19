// level-100 refactoring
// Change the template id to "episode-card-template"
// In the rendering process (makePageForEpisodes), use map instead of forEach
// to create a new array [card1, ..., cardN] without touching the DOM

//                                            level-200 refactoring
// use a state object for global variables (allEpisodes && searchTerm)

// Episode selector
// I removed setupShowAllButton() because I use
// selectedElement.scrollIntoView({ behavior: "smooth", block: "start" });
// I created an id for each episode and used the same id as the option value

const state = {
  allEpisodes: [],
  searchTerm: "",
};

// fetch the data
const endpoint = "https://api.tvmaze.com/shows/82/episodes";

const fetchAllEpisodes = async () => {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

window.addEventListener("load", () => {
  const statusElm = document.getElementById("status");
  statusElm.textContent = "Loading episodes ...";
  fetchAllEpisodes()
    .then((episodes) => {
      state.allEpisodes = episodes;
      statusElm.textContent = "";
      setup();
    })
    .catch(() => {
      statusElm.textContent =
        "Sorry- failed to load episodes. Please refresh the page";
    });
});

//rendering

function setup() {
  makePageForEpisodes(state.allEpisodes);
  setupSearch();
  setupEpisodeSelector();
}

/* Page Creation */

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous episodes
  const episodeCards = episodeList.map(episodeCard);
  rootElem.append(...episodeCards);
  updateEpisodeCount(episodeList.length);
}

function episodeCard({ name, image, season, number, summary, id }) {
  const template = document.getElementById("episode-card-template");
  const card = template.content.cloneNode(true);
  const root = card.firstElementChild; //add an id for each episode for selector function
  root.id = String(id);
  const episodeCode = formatEpisodeCode(season, number);

  card.querySelector(".episode-title").textContent = `${name}-${episodeCode}`;

  const img = card.querySelector(".episode-img");
  img.src = image?.medium || "";
  img.alt = name || "";

  card.querySelector(".episode-summary").innerHTML = summary;
  return card;
}

/* Search bar */

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", handleSearch);
}

function matchesSearch(name, summary, searchTerm) {
  const term = searchTerm.toLowerCase();
  return (
    (name && name.toLowerCase().includes(term)) ||
    (summary && summary.toLowerCase().includes(term)) ///check after filter
  );
}

function handleSearch(event) {
  state.searchTerm = event.target.value;
  const filteredEpisodes = state.allEpisodes.filter((episode) =>
    matchesSearch(episode.name, episode.summary, state.searchTerm)
  );
  makePageForEpisodes(filteredEpisodes);
}

function updateEpisodeCount(count) {
  const countElem = document.getElementById("episode-count");
  countElem.textContent = `Displaying ${count} / ${state.allEpisodes.length} episodes`;
}

/* Episode Select Dropdown */

function setupEpisodeSelector() {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="">Jump to an episode...</option>';
  state.allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    option.value = String(episode.id); //use the episode id as the option value
    option.textContent = `${episodeCode} - ${episode.name}`;
    select.append(option);
  });

  select.addEventListener("change", handleEpisodeSelect);
}

function handleEpisodeSelect(event) {
  const selectedId = event.target.value;

  if (!selectedId) {
    return;
  }
  const selectedElement = document.getElementById(selectedId);
  if (!selectedElement) return;
  selectedElement.scrollIntoView({ behavior: "smooth", block: "start" });
}
/* Helper Functions */

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
}
