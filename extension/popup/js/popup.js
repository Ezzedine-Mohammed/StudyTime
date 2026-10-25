import "./db.js";
import { navigate } from "./navigation.js";
import { sessionData } from "./session.js";
import { starterTimer, pauseTimer, resumeTimer } from "./timer.js";
import { newSession, viewHistory, emptyHistory } from "./history.js";
import { addSession } from "./sessionRepository.js";

// variables
let isStartingSession = false;

// DOM elements
export const setupForm = document.getElementById("setup-form");
const inputTitle = document.getElementById("session-setup-title");
const submitBtns = [...document.querySelectorAll("[type='submit']")];

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

// enable, disable submit btns
function submitButtonsControl(disabled) {
  submitBtns.forEach((button) => {
    button.disabled = disabled;
  });
}

// Submit the session setup form
setupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Prevent repeated submissions while saving
  if (isStartingSession) return;

  isStartingSession = true;

  // Remember each button's previous state
  const previousButtonStates = submitBtns.map((button) => ({
    button,
    disabled: button.disabled,
  }));

  try {
    submitButtonsControl(true);

    // Read the form values
    const title = setupForm.elements["session-setup-title"].value.trim();

    const duration = setupForm.elements["session-setup-duration"].valueAsNumber;

    // Prepare the new session data
    sessionData.title = title;
    sessionData.duration = duration;
    sessionData.start = Date.now();
    sessionData.end = null;
    sessionData.status = "active";
    sessionData.remainingMs = duration * 60 * 1000;
    sessionData.progressPercent = 0;
    sessionData.pauseCount = 0;
    sessionData.attempts = 0;

    // Let IndexedDB generate a new ID
    delete sessionData.id;

    // Save the session and keep its generated ID
    const sessionId = await addSession(sessionData);
    sessionData.id = sessionId;

    // Start the timer and display the active session
    sessionSubScreen();
  } catch (error) {
    console.error("Could not start the session:", error);
  } finally {
    isStartingSession = false;
    submitButtonsControl(false);
  }
});

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
