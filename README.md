# 🎄 Frostflix — Christmas Movie Picker

**Frostflix** is a cozy, aesthetic web app that helps you find the perfect Christmas movie every day based on your mood and preferences. Pick a mood, set filters like runtime or release year, and discover a festive movie to enjoy. Track what you’ve watched with a calendar log, save favorites, and switch between light and dark frosty themes!

**Live Demo:** [[Frostflix](https://sapphiremoonlight.github.io/Frostflix/)]

---

## **Features**

* 🌟 **Mood-Based Movie Recommendations** – Happy, Romantic, Scary, Adventurous, or Dramatic
* 🎬 **Only Christmas Movies** – filtered from TMDb with keyword search
* 🎨 **Pinterest-Worthy UI** – frosted glass cards, candy cane buttons, light/dark modes
* ⭐ **Favorites** – save movies you want to rewatch
* 📅 **Calendar Log** – track daily movies watched through December
* ⚙️ **Filters** – rating, runtime, release year
* 🎥 **Trailer Links** – watch trailers directly on YouTube

---

## **Tech Stack**

* HTML, CSS, JavaScript (Vanilla)
* TMDb API for movie data
* LocalStorage for favorites & calendar logging
* CSS variables for light & dark frosty themes

---

## **Getting Started**

1. Clone the repo:

```bash
git clone https://github.com/sapphiremoonlight/Frostflix.git
```

2. Open the project in VS Code (recommended).
3. Install **Live Server** extension in VS Code.
4. Right-click `index.html` → **“Open with Live Server”** to run the app locally.

   > ⚠️ The app uses fetch to load tab HTML files, so opening with `file://` will not work properly.
5. Replace `YOUR_TMDB_API_KEY` in `script.js` with your TMDb API key.

---

## **Folder Structure**

```
frostflix/
│ index.html
│ style.css
│ script.js
├─ tabs/
│   ├ picker.html
│   ├ favorites.html
│   ├ calendar.html
│   └ settings.html
└─ README.md
```

---

## **Deployment on GitHub Pages**

1. Commit and push your project to GitHub.
2. Go to **Settings → Pages**.
3. Set the source branch to `main` (or `master`) and root folder `/`.
4. Save and wait a few minutes.
5. Your site will be live at `https://sapphiremoonlight/Frostflix/`
