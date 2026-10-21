// Navigation
export function navigate(tab) {
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
