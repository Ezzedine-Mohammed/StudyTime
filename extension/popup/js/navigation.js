import { displaySessions } from "./history.js";

// dom elements
const main = document.getElementById("main");

// Navigation
export async function navigate(tab) {
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

  if (nextScreen.dataset.screen === "history") {
    try {
      await displaySessions();
    } catch (error) {
      console.error("Could not start the session:", error);
    }
  }

  main.scrollTo({ top: 0 });
}
