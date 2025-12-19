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
  allShows: [],
  allEpisodes: [],
  searchTerm: "",
  episodeByShowId: new Map(),
};

// fetch the data

const fetchAllShows = async () => {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

const fetchEpisodesForShow = async (showId) => {
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

window.addEventListener("load", async () => {
  const statusElm = document.getElementById("status");
  statusElm.textContent = "Loading  ...";

  try {
    const [shows, episodes] = await Promise.all([
      fetchAllShows(),
      fetchEpisodesForShow(82),
    ]);
    state.allShows = shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    state.episodeByShowId.set(82, episodes);
    state.allEpisodes = episodes;

    statusElm.textContent = "";
    setup();
  } catch {
    statusElm.textContent =
      "Sorry, failed to load data. Please refresh the page.";
  }
});

//rendering

function setup() {
  setupSearch();
  setupEpisodeSelector();
  setupShowsSelector();
  makePageForEpisodes(state.allEpisodes);
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
  select.addEventListener("change", handleEpisodeSelect);
  populateEpisodeSelector();
}
function populateEpisodeSelector() {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="">Jump to an episode...</option>';
  state.allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    option.value = String(episode.id); //use the episode id as the option value
    option.textContent = `${episodeCode} - ${episode.name}`;
    select.append(option);
  });
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

// level-400 plan
//https://api.tvmaze.com/shows/show.id/show.name
// add select element to the HTML file
//I need a why to fetch all show and store them and state object
//I need a why so sort show in alphabetical order
//add the shows to select as options
//take the episodes of the selected show and store them in state.allEpisodes
//make suer all feature works

/* Shows Select Dropdown */
function setupShowsSelector() {
  const showsSelector = document.getElementById("show-selector");
  showsSelector.innerHTML = '<option value="">Select a show...</option>';
  state.allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = `${show.name}`;
    showsSelector.append(option);
  });
  showsSelector.addEventListener("change", handleShowsSelector);
}
async function handleShowsSelector(event) {
  const showId = Number(event.target.value);
  if (!showId) return;
  const statusElm = document.getElementById("status");
  statusElm.textContent = "Loading episodes ...";
  try {
    let episodes;
    if (state.episodeByShowId.has(showId)) {
      episodes = state.episodeByShowId.get(showId);
    } else {
      episodes = await fetchEpisodesForShow(showId);
      state.episodeByShowId.set(showId, episodes);
    }
    state.allEpisodes = episodes;

    // clean the search
    state.searchTerm = "";
    document.getElementById("search-input").value = "";
    makePageForEpisodes(state.allEpisodes);
    populateEpisodeSelector();
    document.getElementById("episode-select").value = "";
    statusElm.textContent = "";
  } catch {
    statusElm.textContent =
      "Sorry - failed to load episodes. Please refresh the page.";
  }
}
