/***************************************************
 *                  C O N F I G
 ***************************************************/
const API_KEY = "15edf5f6cb594f8289d42380add9108d";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";


/***************************************************
 * GLOBAL APP STATE
 ***************************************************/
let christmasMovies = [];         // full pool
let currentMoodMovies = [];       // mood + filters
let currentMovie = null;

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let movieLog = JSON.parse(localStorage.getItem("movieLog") || "{}");

/***************************************************
 * TAB HANDLING — dynamic loading
 ***************************************************/
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  loadTab("picker");
  setupThemeToggle();
  setupSettingsFilters();
  fetchChristmasMovies();
});

/* Load HTML fragment from /tabs folder */
async function loadTab(name) {
  const res = await fetch(`tabs/${name}.html`);
  const html = await res.text();
  const app = document.getElementById("app");

  app.innerHTML = html;
  highlightActiveTab(name);

  // After loading tab: attach handlers
  if (name === "picker") initPickerTab();
  if (name === "favorites") renderFavorites();
  if (name === "calendar") buildCalendar();
  if (name === "settings") initSettingsTab();
}

/* Setup navigation event listeners */
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadTab(btn.dataset.tab);
    });
  });
}

/* Highlight active tab */
function highlightActiveTab(name) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });
}

/***************************************************
 * THEME TOGGLE (Light/Dark Frost Mode)
 ***************************************************/
function setupThemeToggle() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);

  document.addEventListener("change", (e) => {
    if (e.target.id === "theme-toggle") {
      const theme = e.target.value;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  });
}

/***************************************************
 * SETTINGS: FILTERS
 ***************************************************/
function setupSettingsFilters() {
  document.addEventListener("input", (e) => {
    if (e.target.id === "filter-year") {
      document.getElementById("year-output").textContent = e.target.value;
    }
  });
}

function getFilters() {
  return {
    rating: document.getElementById("filter-rating")?.value || "",
    runtime: document.getElementById("filter-runtime")?.value || "",
    year: document.getElementById("filter-year")?.value || ""
  };
}

function passesFilters(movie, filters) {
  if (filters.year) {
    const movieYear = movie.release_date?.slice(0, 4);
    if (movieYear < filters.year) return false;
  }
  // Skipping strict rating as TMDB doesn't provide MPAA directly
  return true;
}

async function passesRuntimeFilter(movie, runtimeSetting) {
  if (!runtimeSetting) return true;

  const details = await fetch(
    `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
  ).then(r => r.json());

  const runtime = details.runtime;

  if (!runtime) return true;

  if (runtimeSetting === "short") return runtime < 90;
  if (runtimeSetting === "medium") return runtime >= 90 && runtime <= 120;
  if (runtimeSetting === "long") return runtime > 120;

  return true;
}

/***************************************************
 * MOOD → GENRE MAP
 ***************************************************/
const moodMap = {
  happy: [35, 10751],
  scary: [27, 53],
  romantic: [10749, 18],
  adventurous: [12, 28],
  dramatic: [18, 36]
};

/***************************************************
 * FETCH CHRISTMAS MOVIES
 ***************************************************/
async function getChristmasKeywordID() {
  const res = await fetch(
    `${BASE_URL}/search/keyword?api_key=${API_KEY}&query=christmas`
  );
  const data = await res.json();
  return data.results[0]?.id || null;
}

async function fetchChristmasMovies() {
  const keywordId = await getChristmasKeywordID();
  if (!keywordId) return;

  let page = 1;
  christmasMovies = [];

  while (page <= 5) {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${keywordId}&sort_by=popularity.desc&page=${page}`
    );
    const data = await res.json();

    christmasMovies.push(...data.results);
    page++;
  }
}

/***************************************************
 * PICKER TAB INITIALIZATION
 ***************************************************/
function initPickerTab() {
  const moodButtons = document.querySelectorAll(".mood-btn");

  moodButtons.forEach(btn => {
    btn.addEventListener("click", () => handleMoodSelect(btn.dataset.mood));
  });

  document.getElementById("next-movie")?.addEventListener("click", () => {
    if (currentMoodMovies.length) displayMovie(randomMovie());
  });

  document.getElementById("favorite-btn")?.addEventListener("click", addToFavorites);
  document.getElementById("watched-btn")?.addEventListener("click", toggleWatched);
}

async function handleMoodSelect(mood) {
  const genreIDs = moodMap[mood];
  const filters = getFilters();

  currentMoodMovies = christmasMovies.filter(movie =>
    movie.genre_ids.some(g => genreIDs.includes(g)) && passesFilters(movie, filters)
  );

  const filtered = [];
  for (const m of currentMoodMovies) {
    if (await passesRuntimeFilter(m, filters.runtime)) filtered.push(m);
  }

  currentMoodMovies = filtered;

  if (!currentMoodMovies.length) {
    alert("No Christmas movies match this mood & filters!");
    return;
  }

  displayMovie(randomMovie());
}

function randomMovie() {
  const i = Math.floor(Math.random() * currentMoodMovies.length);
  return currentMoodMovies[i];
}

/***************************************************
 * DISPLAY MOVIE
 ***************************************************/
async function displayMovie(movie) {
  currentMovie = movie;

  document.getElementById("movie-display").style.display = "block";

  document.getElementById("movie-poster").src = IMAGE_BASE + movie.poster_path;
  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-overview").textContent = movie.overview;
  document.getElementById("movie-info").textContent =
    `⭐ ${movie.vote_average} | 📅 ${movie.release_date}`;

  const res = await fetch(
    `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
  );
  const data = await res.json();
  const trailer = data.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  const link = document.getElementById("trailer-link");
  if (trailer) {
    link.hidden = false;
    link.href = `https://www.youtube.com/watch?v=${trailer.key}`;
  } else {
    link.hidden = true;
  }

  logToday(movie); // auto-log current movie
}

/***************************************************
 * WATCHED / UNWATCHED
 ***************************************************/
function toggleWatched() {
  if (!currentMovie) return;

  const today = new Date().toISOString().slice(0, 10);

  if (movieLog[today] && movieLog[today].id === currentMovie.id) {
    movieLog[today].watched = !movieLog[today].watched;
  } else {
    movieLog[today] = { ...currentMovie, watched: true };
  }

  localStorage.setItem("movieLog", JSON.stringify(movieLog));
  buildCalendar();
  alert(movieLog[today].watched ? "Marked as watched!" : "Marked as unwatched!");
}

/***************************************************
 * FAVORITES
 ***************************************************/
function addToFavorites() {
  if (!currentMovie) return;

  if (!favorites.find(m => m.id === currentMovie.id)) {
    favorites.push(currentMovie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  alert("Added to favorites!");
}

function renderFavorites() {
  const list = document.getElementById("favorites-list");
  list.innerHTML = "";

  if (!favorites.length) {
    list.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach(movie => {
    const div = document.createElement("div");
    div.className = "favorite-card";

    div.innerHTML = `
      <img src="${IMAGE_BASE + movie.poster_path}">
      <p>${movie.title}</p>
      <button class="remove-fav">Remove</button>
    `;

    div.querySelector(".remove-fav").addEventListener("click", () => {
      removeFavorite(movie.id);
    });

    list.appendChild(div);
  });
}

function removeFavorite(movieId) {
  favorites = favorites.filter(m => m.id !== movieId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

/***************************************************
 * DAILY MOVIE LOG — CALENDAR (with toggle)
 ***************************************************/
function buildCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const year = new Date().getFullYear();
  const month = 11; // December
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-12-${String(d).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "calendar-day";

    if (movieLog[dateStr]) div.classList.add("logged");

    div.textContent = d;

    div.addEventListener("click", () => openCalendarDay(dateStr));

    cal.appendChild(div);
  }
}

function openCalendarDay(dateStr) {
  const movie = movieLog[dateStr];
  const panel = document.getElementById("calendar-details");

  if (!movie) {
    panel.style.display = "none";
    return;
  }

  panel.style.display = "block";
  document.getElementById("log-date").textContent = dateStr;
  document.getElementById("log-poster").src = IMAGE_BASE + movie.poster_path;
  document.getElementById("log-title").textContent = movie.title;
  document.getElementById("log-overview").textContent = movie.overview;

  const toggleBtn = document.getElementById("toggle-watched");
  toggleBtn.textContent = "Mark as Unwatched";

  toggleBtn.onclick = () => toggleWatched(dateStr);
}

function toggleWatched(dateStr) {
  if (movieLog[dateStr]) {
    // Remove watched
    delete movieLog[dateStr];
  } else if (currentMovie) {
    // Mark current movie as watched for this day
    movieLog[dateStr] = currentMovie;
  }
  localStorage.setItem("movieLog", JSON.stringify(movieLog));
  buildCalendar();           // refresh calendar
  openCalendarDay(dateStr);  // refresh panel
}

/***************************************************
 * SETTINGS: INIT
 ***************************************************/
function initSettingsTab() {
  const themeSelect = document.getElementById("theme-toggle");
  themeSelect.value = localStorage.getItem("theme") || "light";

  const year = document.getElementById("filter-year");
  if (year) document.getElementById("year-output").textContent = year.value;
}
