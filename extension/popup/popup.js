// DOM elements
const sessionSection = document.getElementById("session");
const siteSection = document.getElementById("site");
const historySection = document.getElementById("history");
const statisticsSection = document.getElementById("statistics");
const settingsSection = document.getElementById("settings");

// Navigation function
function navigate(tab) {
  // Find the destination screen
  const destination = tab.dataset.view;
  const nextScreen = document.querySelector(`[data-screen="${destination}"]`);

  if (!nextScreen) return;

  // Find the active tab and its screen
  const activeTab = document.querySelector(".tab.active");

  if (activeTab) {
    const currentView = activeTab.dataset.view;
    const currentScreen = document.querySelector(
      `[data-screen="${currentView}"]`,
    );

    activeTab.classList.remove("active");

    if (currentScreen) {
      currentScreen.hidden = true;
    }
  }

  // Activate the destination tab and show its screen
  tab.classList.add("active");
  nextScreen.hidden = false;
}

// Event listener
document.addEventListener("click", (e) => {
  const btn = e.currentTarget;
  navigate(btn);
});

document.addEventListener("click", (event) => {
  // navigate listener
  const tab = event.target.closest(".tab");

  if (!tab) return;

  navigate(tab);
});
