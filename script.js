//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  searchBox(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";
  const fragment = document.createDocumentFragment();

  for (const episode of episodeList) {
    const card = episodeCard(episode);
    fragment.appendChild(card);
  }

  rootElem.appendChild(fragment);
}

function formatEpisodeCode({ season, number }) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
}

function episodeCard(episode) {
  const epCode = formatEpisodeCode(episode);

  const titleElem = document.createElement("h2");
  titleElem.className = "episode-title";
  titleElem.textContent = `${episode.name} — ${epCode}`;

  const imageElem = document.createElement("img");
  imageElem.className = "episode-img";
  // Check if image.medium exists
  imageElem.src = episode.image?.medium || "";
  imageElem.alt = `${episode.name} poster`;

  const summaryElem = document.createElement("p");
  summaryElem.className = "episode-summary";
  summaryElem.textContent =
    // Remove HTML tags
    episode.summary?.replace(/<[^>]+>/g, "") || "No summary available.";

  const linkElem = document.createElement("a");
  linkElem.className = "episode-link";
  linkElem.href = episode.url;
  linkElem.target = "_blank";
  linkElem.textContent = "View on TVMaze.com";

  const cardElem = document.createElement("article");
  cardElem.className = "episode-card";
  cardElem.appendChild(titleElem);
  cardElem.appendChild(imageElem);
  cardElem.appendChild(summaryElem);
  cardElem.appendChild(linkElem);
  return cardElem;
}

function addSearchBox() {
  const searchBox = document.createElement("input");
  searchBox.type = "search";
  searchBox.id = "search-input";
  searchBox.placeholder = "Search episodes";
  document.body.prepend(searchBox);
  return searchBox;
}
//event.target.value;

function doesEpisodeMatchSearch({ name, summary }, searchInputValue) {
  return (
    (name ||"").toLowerCase().includes(searchInputValue) ||
    (summary ||"").toLowerCase().includes(searchInputValue)
  );
}
function searchBox(allEpisodes) {
  const searchInput = addSearchBox();
  searchInput.addEventListener("input", (event) => {
    const inputVal = event.target.value.toLowerCase();
    const newEpisodeList = allEpisodes.filter((episode) =>
      doesEpisodeMatchSearch(episode, inputVal)
    );
    makePageForEpisodes(newEpisodeList);
  });
}

window.onload = setup;
