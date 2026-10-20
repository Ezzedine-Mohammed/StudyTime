// variables
let onSession = false;
let sessionData = {
  title: "",
  duration: 0,
  remainingMs: 0,
  pauseCount: 0,
  attempts: 0,
};
let sessionStatus = false;
let endTime = 0;

// DOM elements
const setupForm = document.getElementById("setup-form");
const inputTitle = document.getElementById("session-setup-title");
const activeSessionTitle = document.getElementById("session-title-data");
const activeSessionDuration = document.getElementById("session-duration-data");
const remainingTimeEle = document.getElementById("remaining-time-data");
const studyTimeEle = document.getElementById("study-time");
const pauseCounterEle = document.getElementById("pause-count");
const sessionStatusEle = document.getElementById("status");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");

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

// navigate to session active screen
function sessionSubScreen() {
  // assign session data to session sub screen
  activeSessionTitle.innerHTML = sessionData["title"];
  activeSessionDuration.innerHTML = sessionData["duration"] + ":00";
  remainingTimeEle.innerHTML = sessionData["duration"] + ":00";
  starterTimer(sessionData["duration"]);

  // hide session setup div and unhide session active
  const sessionSetup = document.getElementById("session-setup");
  sessionSetup.hidden = true;
  const activeSessionScreen = document.getElementById("session-active");
  activeSessionScreen.hidden = false;
}

// Display remaining time
function displayTime(remainingMs) {
  // Remaining time
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  remainingTimeEle.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Study time
  const durationSeconds = sessionData.duration * 60;
  const activeTime = durationSeconds - totalSeconds;
  const activeMinutes = Math.floor(activeTime / 60);
  const activeSeconds = activeTime % 60;

  studyTimeEle.textContent = `${activeMinutes}:${String(activeSeconds).padStart(2, "0")}`;

  // Pause counter
  pauseCounterEle.textContent = sessionData.pauseCount;
}

// start timer
function starterTimer(duration) {
  sessionData.remainingMs = duration * 60 * 1000;
  endTime = Date.now() + sessionData.remainingMs;

  displayTime(sessionData.remainingMs);

  timer = setInterval(() => {
    sessionData.remainingMs = Math.max(0, endTime - Date.now());
    displayTime(sessionData.remainingMs);

    if (sessionData.remainingMs === 0) {
      clearInterval(timer);

      // Handle session completion here later
    }
  }, 1000);
}

// pause timer
function pauseTimer() {
  // Save the exact remaining time at the moment of pausing
  sessionData.remainingMs = Math.max(0, endTime - Date.now());
  clearInterval(timer);

  sessionStatus = false;
  sessionStatusEle.textContent = "paused";
  sessionStatusEle.classList.add("pause");
  pauseBtn.hidden = true;
  resumeBtn.hidden = false;
  sessionData.pauseCount++;
}

// resume timer
function resumeTimer() {
  sessionStatus = true;
  sessionStatusEle.textContent = "active";
  sessionStatusEle.classList.remove("pause");
  pauseBtn.hidden = false;
  resumeBtn.hidden = true;

  starterTimer(sessionData.remainingMs / 60000);
}

// check valid to session title input each time the user add a character
inputTitle.addEventListener("input", () => {
  if (inputTitle.value === "") {
    inputTitle.setCustomValidity("Session title cannot be empty.");
    inputTitle.reportValidity();
  } else if (inputTitle.value.trim() === "") {
    inputTitle.setCustomValidity(
      "The session title cannot contain only spaces.",
    );
    inputTitle.reportValidity();
  } else if (inputTitle.value.length > 50) {
    inputTitle.setCustomValidity("Session title max length is 50.");
    inputTitle.reportValidity();
  } else {
    inputTitle.setCustomValidity("");
  }
});

// // Form validation functions
setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  onSession = true;
  let titleInput = setupForm.elements["session-setup-title"].value;
  let durationInput = setupForm.elements["session-setup-duration"].value;
  sessionData.title = titleInput;
  sessionData.duration = durationInput;
  sessionSubScreen();
  onSession = true;
  sessionStatus = true;
  console.log(sessionData);
  // save input data to the database, use trim method with the title value
});

setupForm;
// Event listener
document.addEventListener("click", (event) => {
  // navigate listener
  const tab = event.target.closest(".tab");
  if (tab) {
    navigate(tab);
  }

  // pause session listener
  const pause = event.target.closest("#pause-btn");
  if (pause) {
    pauseTimer();
  }

  // resume session listener
  const resume = event.target.closest("#resume-btn");
  if (resume) {
    resumeTimer();
  }
  return;
});
