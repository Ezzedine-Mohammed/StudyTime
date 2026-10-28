import { sessionData } from "./session.js";
import { timesUp } from "./history.js";
import { modifySession } from "./sessionRepository.js";

// DOM elements
const remainingTimeEle = document.getElementById("remaining-time-data");
const studyTimeEle = document.getElementById("study-time");
const pauseCounterEle = document.getElementById("pause-count");
const sessionStatusEle = document.getElementById("status");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const blockingPaused = document.getElementById("blocking-paused");
const blockingActive = document.getElementById("blocking-active");
const timerCircle = document.getElementById("timer");

const setupForm = document.getElementById("setup-form");

const endEarlyScreen = document.getElementById("end-early");

// Timer variables
let timer = null;
let endTime = 0;

// Update the timer and session interface
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

  // Session status and counters
  sessionStatusEle.textContent = sessionData.status;
  pauseCounterEle.textContent = sessionData.pauseCount;

  sessionStatusEle.classList.toggle("pause", sessionData.status === "paused");

  // Session controls
  pauseBtn.hidden = sessionData.status !== "active";
  resumeBtn.hidden = sessionData.status !== "paused";

  // Blocking indicators
  blockingActive.hidden = sessionData.status !== "active";
  blockingPaused.hidden = sessionData.status !== "paused";

  // Timer border
  timerCircle.style.background = `linear-gradient(white, white) padding-box,
    conic-gradient(
      ${sessionData.status === "paused" ? "var(--muted)" : "var(--brand)"}
      ${sessionData.progressPercent}%,
      #dce4e0 0
    ) border-box`;
}

// Resume timer
export async function resumeTimer() {
  // Prevent resuming an already active or finished session
  if (sessionData.status !== "paused") return;

  if (sessionData.remainingMs <= 0) {
    // Handle session completion here
    await finishedSession();
    return;
  }

  sessionData.status = "active";

  starterTimer(sessionData.remainingMs / 60000);

  try {
    await modifySession(sessionData);
  } catch (error) {
    console.error("Session resumed, but saving failed:", error);
  }
}

// Reset the session screens after saving
function resetSessionView() {
  setupForm.reset();

  document.getElementById("session-setup").hidden = false;
  document.getElementById("session-active").hidden = true;
  endEarlyScreen.hidden = true;
}

async function finishedSession() {
  clearInterval(timer);

  sessionData.end = Date.now();

  // Update remaining time only if the session is active
  if (sessionData.status === "active") {
    sessionData.remainingMs = Math.max(0, endTime - sessionData.end);
  }

  sessionData.status =
    sessionData.remainingMs === 0 ? "Completed" : "EndedEarly";

  sessionData.progressPercent =
    100 - (sessionData.remainingMs / (sessionData.duration * 60000)) * 100;

  displayTime(sessionData.remainingMs);
  endEarlyScreen.hidden = true;

  try {
    await modifySession(sessionData);

    resetSessionView();
    timesUp();
  } catch (error) {
    console.error("Session ended, but saving failed:", error);
  }
}

export async function confirmEnd() {
  if (sessionData.status !== "active" && sessionData.status !== "paused") {
    return;
  }

  await finishedSession();
}

// // Start timer
export function starterTimer(duration) {
  // Stop any previous interval
  clearInterval(timer);

  // change this before lunching the project
  sessionData.remainingMs = duration * 60 * 1000;
  endTime = Date.now() + sessionData.remainingMs;

  displayTime(sessionData.remainingMs);

  timer = setInterval(async () => {
    // Calculate remaining time
    sessionData.remainingMs = Math.max(0, endTime - Date.now());

    // Calculate study progress
    const totalMs = sessionData.duration * 60 * 1000;

    sessionData.progressPercent =
      100 - (sessionData.remainingMs / totalMs) * 100;

    // Update the interface after updating the data
    displayTime(sessionData.remainingMs);

    if (sessionData.remainingMs === 0) {
      await finishedSession();
    }
  }, 100);
}

// Pause timer
export async function pauseTimer() {
  // Prevent pausing an already paused or finished session
  if (sessionData.status !== "active") return;

  clearInterval(timer);

  // Save the exact remaining time at the moment of pausing
  sessionData.remainingMs = Math.max(0, endTime - Date.now());

  // Complete the session if its time has already elapsed
  if (sessionData.remainingMs === 0) {
    await finishedSession();
    return;
  }

  sessionData.status = "paused";
  sessionData.pauseCount++;

  sessionData.progressPercent =
    100 - (sessionData.remainingMs / (sessionData.duration * 60000)) * 100;

  // Update the interface
  displayTime(sessionData.remainingMs);

  // Persist the paused session
  try {
    await modifySession(sessionData);
  } catch (error) {
    console.error("Session paused, but saving failed:", error);
  }
}
