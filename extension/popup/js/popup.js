import { navigate } from "./navigation.js";
import { sessionData } from "./session.js";
import { starterTimer, pauseTimer, resumeTimer } from "./timer.js";
import { newSession, viewHistory, emptyHistory } from "./history.js";

// Variables
let onSession = false;

// DOM elements
const setupForm = document.getElementById("setup-form");
const inputTitle = document.getElementById("session-setup-title");

const activeSessionTitle = document.getElementById("session-title-data");
const activeSessionDuration = document.getElementById("session-duration-data");
const remainingTimeEle = document.getElementById("remaining-time-data");

// Navigate to the active session screen
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

// Event listeners
// Validate the session title on input
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

// Submit the session setup form
setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  onSession = true;
  let titleInput = setupForm.elements["session-setup-title"].value;
  let durationInput = setupForm.elements["session-setup-duration"].value;
  sessionData.title = titleInput;
  sessionData.duration = durationInput;
  sessionData.start = Date.now();
  sessionData.status = "Still on";

  sessionSubScreen();
  onSession = true;
  // console.log(sessionData);
  // save input data to the database, use trim method with the title value
});

setupForm;

// Navigation and session controls
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

  // summary new session
  const summaryNewSessionBtn = event.target.closest("#summary-new-session");
  if (summaryNewSessionBtn) {
    newSession();
  }
  // summary view history
  const summaryViewHistory = event.target.closest("#summary-view-history");
  if (summaryViewHistory) {
    viewHistory();
  }
  // summary view history
  const historyNewSessionBtn = event.target.closest("#empty-history-btn");
  if (historyNewSessionBtn) {
    emptyHistory();
  }

  return;
});
