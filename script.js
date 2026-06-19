/* =========================================================
   PORTFOLIO SCRIPT.JS
   Beginner-friendly version - plain functions, no frameworks.
   This file does 3 things:
   1. Fetches GitHub repos and displays them as cards
   2. Handles the "Show More Projects" button
   3. Fades sections in as you scroll down the page
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

// Grab the HTML elements we need to update.
var projectsContainer = document.getElementById("projects-container");
var showMoreButton = document.getElementById("show-more");
var errorMessage = document.getElementById("projects-error");


/* =========================================================
   FUNCTION: getRepos
   Fetches the user's public repos from the GitHub API.
   ========================================================= */
function getRepos() {

  // Build the API URL using the username above.
  // "sort=updated" makes GitHub return the most recently
  // updated repos first.
  var apiUrl = "https://api.github.com/users/" + githubUsername + "/repos?sort=updated&per_page=100";

  fetch(apiUrl)
    .then(function (response) {
      // If GitHub sends back an error status (like 404),
      // throw an error so it gets caught below.
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

      // Now that we have real data, draw the cards on screen.
      showRepoCards();

      // Only show the "Show More" button if there are
      // more repos than we're currently displaying.
      if (allRepos.length > reposPerPage) {
        showMoreButton.classList.remove("hidden");
      }
    })
    .catch(function (error) {
      // Something went wrong (bad username, no internet, etc).
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

  // Clear out the skeleton loading cards / old cards.
  projectsContainer.innerHTML = "";

  // Only loop through up to "visibleCount" repos.
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

  // Create the outer card div.
  var card = document.createElement("div");
  card.className = "repo-card";

  // Use the description if there is one, otherwise show
  // a simple fallback message.
  var description = repo.description ? repo.description : "No description provided.";

  // Format the last updated date into something readable,
  // e.g. "12 Jun 2026" instead of the raw timestamp.
  var updatedDate = new Date(repo.updated_at).toLocaleDateString();

  // Build the "Live Demo" button only if the repo has a
  // homepage link set. Otherwise leave it blank.
  var demoButtonHtml = "";
  if (repo.homepage) {
    demoButtonHtml = '<a class="btn-demo" href="' + repo.homepage + '" target="_blank" rel="noopener noreferrer">Live Demo</a>';
  }

  // Fill in the card's HTML using the repo's data.
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
   "Show More Projects" button click handler
   ========================================================= */
showMoreButton.addEventListener("click", function () {

  // Reveal 8 more repos than before.
  visibleCount = visibleCount + reposPerPage;

  showRepoCards();

  // Hide the button once everything is already visible.
  if (visibleCount >= allRepos.length) {
    showMoreButton.classList.add("hidden");
  }
});


/* =========================================================
   Fade-in sections as the user scrolls
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
  }, { threshold: 0.15 }); // trigger when 15% of the section is visible

  for (var i = 0; i < sections.length; i++) {
    observer.observe(sections[i]);
  }
}


/* =========================================================
   Set the footer year automatically so it never goes
   out of date.
   ========================================================= */
function setFooterYear() {
  var yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}


/* =========================================================
   Run everything once the page has loaded.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  getRepos();
  setupScrollAnimations();
  setFooterYear();
});