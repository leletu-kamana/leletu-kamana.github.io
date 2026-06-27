/* =========================================================
   PORTFOLIO SCRIPT.JS
   This single file is shared by all 4 pages (index.html,
   about.html, projects.html, contact.html).

   Because not every page has the same elements (only
   projects.html has the repo cards, for example), each
   feature below checks "does this element actually exist
   on this page?" before trying to use it. This stops the
   console from showing errors on pages that don't need
   that feature.

   This file does 5 things:
   1. Renders the Lucide icons (every page)
   2. Fetches GitHub repos and displays them (projects.html only)
   3. Handles the "Show More Projects" button (projects.html only)
   4. Toggles the mobile menu open/closed (every page)
   5. Fades sections in as you scroll, and sets the footer year (every page)
   ========================================================= */

// STEP 1: Set your GitHub username here.
// This is the only thing you NEED to change in this file.
var githubUsername = "leletu-kamana";

// How many repo cards to show at first, and how many more
// to reveal each time "Show More" is clicked.
var reposPerPage = 8;

// Keeps track of how many repos are currently visible on screen.
var visibleCount = reposPerPage;

// Will store the repos we get back from GitHub once they load.
var allRepos = [];

// Grab the elements used on the Projects page.
// On other pages these will simply be "null", which is fine -
// we check for that before using them further down.
var projectsContainer = document.getElementById("projects-container");
var showMoreButton = document.getElementById("show-more");
var errorMessage = document.getElementById("projects-error");


/* =========================================================
   FUNCTION: getRepos
   Fetches the user's public repos from the GitHub API.
   ========================================================= */
function getRepos() {

  var apiUrl = "https://api.github.com/users/" + githubUsername + "/repos?sort=updated&per_page=100";

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub API request failed");
      }
      return response.json();
    })
    .then(function (data) {
      // Remove forked repos - we only want original projects.
      var originalRepos = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i].fork === false) {
          originalRepos.push(data[i]);
        }
      }

      allRepos = originalRepos;

      showRepoCards();

      if (allRepos.length > reposPerPage) {
        showMoreButton.classList.remove("hidden");
      }
    })
    .catch(function (error) {
      console.log("Error fetching repos:", error);
      projectsContainer.innerHTML = "";
      errorMessage.classList.remove("hidden");
    });
}


/* =========================================================
   FUNCTION: showRepoCards
   Clears the project container and rebuilds it with cards
   based on how many repos should currently be visible.
   ========================================================= */
function showRepoCards() {

  projectsContainer.innerHTML = "";

  var reposToShow = allRepos.slice(0, visibleCount);

  for (var i = 0; i < reposToShow.length; i++) {
    var repo = reposToShow[i];
    var card = buildRepoCard(repo);
    projectsContainer.appendChild(card);
  }
}


/* =========================================================
   FUNCTION: buildRepoCard
   Takes one repo object from the GitHub API and turns it
   into a card (a <div>) we can put on the page.
   ========================================================= */
function buildRepoCard(repo) {

  var card = document.createElement("div");
  card.className = "repo-card";

  var description = repo.description ? repo.description : "No description provided.";

  var updatedDate = new Date(repo.updated_at).toLocaleDateString();

  var demoButtonHtml = "";
  if (repo.homepage) {
    demoButtonHtml = '<a class="btn-demo" href="' + repo.homepage + '" target="_blank" rel="noopener noreferrer">Live Demo</a>';
  }

  card.innerHTML =
    "<h3>" + repo.name + "</h3>" +
    '<p class="repo-desc">' + description + "</p>" +
    '<p class="repo-meta">' +
      (repo.language ? repo.language : "N/A") + " • ⭐ " + repo.stargazers_count +
    "</p>" +
    '<p class="repo-meta">Updated: ' + updatedDate + "</p>" +
    '<div class="repo-buttons">' +
      demoButtonHtml +
      '<a class="btn-code" href="' + repo.html_url + '" target="_blank" rel="noopener noreferrer">View Code</a>' +
    "</div>";

  return card;
}


/* =========================================================
   "Show More Projects" button click handler.
   Only runs if the button actually exists on this page.
   ========================================================= */
if (showMoreButton) {
  showMoreButton.addEventListener("click", function () {

    visibleCount = visibleCount + reposPerPage;

    showRepoCards();

    if (visibleCount >= allRepos.length) {
      showMoreButton.classList.add("hidden");
    }
  });
}


/* =========================================================
   Render the Lucide icons (github, linkedin, mail, etc).
   The Lucide script tag in each HTML <head> loads the
   library but does NOT draw the icons by itself - this
   function call is what actually turns each
   <i data-lucide="..."></i> into a visible icon.

   We check "typeof lucide" first in case the CDN script
   is ever slow, blocked, or fails to load - this stops
   the rest of script.js (mobile menu, scroll fade, etc)
   from breaking if that happens.
   ========================================================= */
function setupIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.log("Lucide icons did not load - check your internet connection or the CDN link in <head>.");
  }
}


/* =========================================================
   Mobile menu toggle
   Tapping the hamburger icon shows/hides the dropdown menu.
   This runs on every page since every page has a navbar.
   ========================================================= */
function setupMobileMenu() {

  var menuButton = document.getElementById("mobile-menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }
}


/* =========================================================
   Fade-in sections as the user scrolls.
   Uses IntersectionObserver, which just means:
   "watch these elements, and tell me when they enter
   the visible part of the screen."
   ========================================================= */
function setupScrollAnimations() {

  var sections = document.querySelectorAll(".fade-in");

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add("visible");
      }
    }
  }, { threshold: 0.15 });

  for (var i = 0; i < sections.length; i++) {
    observer.observe(sections[i]);
  }
}


/* =========================================================
   Set the footer year automatically so it never goes
   out of date. Runs on every page.
   ========================================================= */
function setFooterYear() {
  var yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}


/* =========================================================
   Run everything once the page has loaded.
   Each function checks for its own elements, so it's safe
   to call all of them on every page.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {

  // Only fetch GitHub repos if we're on a page that has
  // the projects container (i.e. projects.html).
  if (projectsContainer) {
    getRepos();
  }

  setupIcons();
  setupMobileMenu();
  setupScrollAnimations();
  setFooterYear();
});