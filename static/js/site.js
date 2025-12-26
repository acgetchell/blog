"use strict";

function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function makeTeaser(body, terms) {
  const TERM_WEIGHT = 40;
  const NORMAL_WORD_WEIGHT = 2;
  const FIRST_WORD_WEIGHT = 8;
  const TEASER_MAX_WORDS = 10;

  const stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });
  let termFound = false;
  let index = 0;
  const weighted = [];

  const sentences = body.toLowerCase().split(". ");

  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i].split(" ");
    let value = FIRST_WORD_WEIGHT;

    for (let j = 0; j < words.length; j++) {
      const word = words[j];

      if (word.length > 0) {
        for (let k = 0; k < stemmedTerms.length; k++) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1;
    }

    index += 1;
  }

  if (weighted.length === 0) {
    return body;
  }

  const windowWeights = [];
  const windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);

  let curSum = 0;
  for (let i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (let i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  let maxSumIndex = 0;
  if (termFound) {
    let maxFound = 0;
    for (let i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  const teaser = [];
  let startIndex = weighted[maxSumIndex][2];
  for (let i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    const word = weighted[i];
    if (startIndex < word[2]) {
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("…");
  return teaser.join("");
}

function formatSearchResultItem(item, terms) {
  return (
    `<article class='box'>` +
    `<h1 class='title'>` +
    `<a class='link' href='${item.ref}'>${item.doc.title}</a>` +
    `</h1>` +
    `<div class='content mt-2'>` +
    `${makeTeaser(item.doc.body, terms)}` +
    `<a href='${item.ref}'>` +
    `Read More <span class="icon is-small"><i class="fas fa-arrow-right fa-xs"></i></span>` +
    `</a>` +
    `</div>` +
    `</article>`
  );
}

function initSearch() {
  const $searchInput = document.getElementById("search");
  const $searchResults = document.querySelector(".search-results");
  const $searchResultsItems = document.querySelector(".search-results__items");
  
  if (!$searchInput || !$searchResults || !$searchResultsItems) {
    console.warn("Search elements not found");
    return;
  }
  
  const MAX_ITEMS = 10;

  const options = {
    bool: "AND",
    fields: {
      title: { boost: 2 },
      body: { boost: 1 },
    },
  };
  let currentTerm = "";
  
  if (!window.searchIndex) {
    console.warn("Search index not loaded");
    return;
  }
  
  const index = elasticlunr.Index.load(window.searchIndex);

  $searchInput.addEventListener(
    "keyup",
    debounce(function () {
      const term = $searchInput.value.trim();
      if (term === currentTerm || !index) {
        return;
      }
      $searchResults.style.display = term === "" ? "none" : "block";
      $searchResultsItems.innerHTML = "";
      if (term === "") {
        return;
      }

      const results = index.search(term, options);
      if (results.length === 0) {
        $searchResults.style.display = "none";
        return;
      }

      currentTerm = term;
      for (let i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        const item = document.createElement("div");
        item.classList.add("mb-4");
        item.innerHTML = formatSearchResultItem(results[i], term.split(" "));
        $searchResultsItems.appendChild(item);
      }
    }, 150)
  );
}

function documentReadyCallback() {

  if (localStorage.getItem("theme") === "dark") {
    document.body.setAttribute("theme", "dark");
    document.querySelectorAll("img, picture, video, pre").forEach(img => img.setAttribute("theme", "dark"));
    document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.setAttribute("theme", "dark"));
    const darkModeEl = document.getElementById("dark-mode");
    if (darkModeEl) {
      darkModeEl.setAttribute("title", "Switch to light theme");
    }
  }

  const navbarBurger = document.querySelector(".navbar-burger");
  const navbarMenu = document.querySelector(".navbar-menu");
  if (navbarBurger && navbarMenu) {
    navbarBurger.addEventListener("click", () => {
      navbarBurger.classList.toggle("is-active");
      navbarMenu.classList.toggle("is-active");
    });
  }

  document.querySelectorAll("div.navbar-end > a.navbar-item").forEach((el) => {
    const href = el.getAttribute("href");
    const currentPath = location.pathname;
    let isActive = false;
    
    // Exact match for home page
    if (href === "/" && currentPath === "/") {
      isActive = true;
    }
    // For other pages, check if current path starts with href (but not for home)
    else if (href !== "/" && currentPath.startsWith(href)) {
      isActive = true;
    }
    
    if (isActive && !el.classList.contains("is-active")) {
      document.querySelectorAll("a.navbar-item.is-active").forEach(itm => itm.classList.remove("is-active"));
      el.classList.add("is-active");
    }
  })

  const navSearch = document.getElementById("nav-search");
  const searchModal = document.getElementById("search-modal");
  const searchInput = document.getElementById("search");
  if (navSearch && searchModal && searchInput) {
    navSearch.addEventListener("click", (evt) => {
      document.querySelector("html").classList.add("is-clipped");
      searchModal.classList.add("is-active");

      searchInput.focus();
      searchInput.select();
    });
  }

  const modalClose = document.querySelector(".modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", (evt) => {
      document.querySelector("html").classList.remove("is-clipped");
      evt.currentTarget.parentElement.classList.remove("is-active");
    });
  }

  const modalBackground = document.querySelector(".modal-background");
  if (modalBackground) {
    modalBackground.addEventListener("click", (evt) => {
      document.querySelector("html").classList.remove("is-clipped");
      evt.currentTarget.parentElement.classList.remove("is-active");
    });
  }

  // Initialize search functionality
  initSearch();

  const darkModeToggle = document.getElementById("dark-mode");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      if (
        localStorage.getItem("theme") == null ||
        localStorage.getItem("theme") == "light"
      ) {
        localStorage.setItem("theme", "dark");
        document.body.setAttribute("theme", "dark");
        document.querySelectorAll("img, picture, video, pre").forEach(img => img.setAttribute("theme", "dark"));
        document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.setAttribute("theme", "dark"));

        darkModeToggle.setAttribute("title", "Switch to light theme");
      } else {
        localStorage.setItem("theme", "light");
        document.body.removeAttribute("theme");
        document.querySelectorAll("img, picture, video, pre").forEach(img => img.removeAttribute("theme"));
        document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.removeAttribute("theme"));

        darkModeToggle.setAttribute("title", "Switch to dark theme");
      }
    });
  }

  if (typeof mermaid !== "undefined") {
    mermaid.initialize({ startOnLoad: true });
  }

  if (typeof chartXkcd !== "undefined") {
    document.querySelectorAll(".chart").forEach((el, i) => {
      el.setAttribute("id", `chart-${i}`);

      let svg = document.getElementById(`chart-${i}`);
      let { type, ...chartData } = JSON.parse(el.textContent);
      new chartXkcd[type](svg, chartData);
    });
  }

  if (typeof Galleria !== "undefined") {
    document.querySelectorAll(".galleria").forEach((el, i) => {
      el.setAttribute("id", `galleria-${i}`);

      let { images } = JSON.parse(el.textContent);

      for (let image of images) {
        el.insertAdjacentHTML("beforeend",
          `<a href="${image.src}"><img src="${image.src}" data-title="${image.title}" data-description="${image.description}"></a>`
        );
      }

      Galleria.run(".galleria");
    });
  }

  if (typeof mapboxgl !== "undefined") {
    document.querySelectorAll(".map").forEach((el, i) => {
      el.setAttribute("id", `map-${i}`);

      mapboxgl.accessToken = el.querySelector(".mapbox-access-token").textContent.trim();
      let zoom = el.querySelector(".mapbox-zoom").textContent.trim();

      let map = new mapboxgl.Map({
        container: `map-${i}`,
        style: "mapbox://styles/mapbox/light-v10",
        center: [-96, 37.8],
        zoom: zoom,
      });

      map.addControl(new mapboxgl.NavigationControl());

      let geojson = JSON.parse(el.querySelector(".mapbox-geojson").textContent.trim());

      const center = [0, 0];

      geojson.features.forEach(function (marker) {
        center[0] += marker.geometry.coordinates[0];
        center[1] += marker.geometry.coordinates[1];

        new mapboxgl.Marker()
          .setLngLat(marker.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(
                "<h3>" +
                marker.properties.title +
                "</h3><p>" +
                marker.properties.description +
                "</p>"
              )
          )
          .addTo(map);
      });

      center[0] = center[0] / geojson.features.length;
      center[1] = center[1] / geojson.features.length;

      map.setCenter(center);
    });
  }

  if (typeof renderMathInElement !== "undefined") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ]
    });
  }
};

if (document.readyState === 'loading') {  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', documentReadyCallback);
} else {  // `DOMContentLoaded` has already fired
  documentReadyCallback();
}
