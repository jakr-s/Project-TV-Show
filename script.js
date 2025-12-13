//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const fragment = document.createDocumentFragment();

  for (const episode of episodeList) {
    const epCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

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

    const cardElem = document.createElement("article");
    cardElem.className = "episode-card";
    cardElem.appendChild(titleElem);
    cardElem.appendChild(imageElem);
    cardElem.appendChild(summaryElem);

    fragment.appendChild(cardElem);
  }

  rootElem.appendChild(fragment);
}

window.onload = setup;
