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

// Timer variables
let timer = null;
let endTime = 0;

// Timer display
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

// Timer controls
// Start timer
export function starterTimer(duration) {
  // Stop any previous interval
  clearInterval(timer);

  sessionData.remainingMs = duration * 60 * 1000;
  endTime = Date.now() + sessionData.remainingMs;

  displayTime(sessionData.remainingMs);

  timerCircle.style.background = `linear-gradient(white, white) padding-box,
    conic-gradient(var(--brand) ${sessionData.progressPercent}%,
    #dce4e0 0) border-box`;

  timer = setInterval(async () => {
    // Calculate remaining time
    sessionData.remainingMs = Math.max(0, endTime - Date.now());

    displayTime(sessionData.remainingMs);

    // Calculate study progress
    const totalMs = sessionData.duration * 60 * 1000;

    sessionData.progressPercent =
      100 - (sessionData.remainingMs / totalMs) * 100;

    // Update the timer border
    timerCircle.style.background = `linear-gradient(white, white) padding-box,
      conic-gradient(var(--brand) ${sessionData.progressPercent}%,
      #dce4e0 0) border-box`;

    if (sessionData.remainingMs === 0) {
      // Stop the interval before waiting for the database
      clearInterval(timer);

      sessionData.end = Date.now();
      sessionData.status = "completed";

      try {
        await modifySession(sessionData);

        setupForm.reset();

        const sessionSetup = document.getElementById("session-setup");
        sessionSetup.hidden = false;
        const activeSessionScreen = document.getElementById("session-active");
        activeSessionScreen.hidden = true;

        timesUp();
      } catch (error) {
        console.error("Session completed, but saving failed:", error);
      }
    }
  }, 1000);
}

// Pause timer
export async function pauseTimer() {
  // Prevent pausing an already paused or finished session
  if (sessionData.status !== "active") return;

  clearInterval(timer);

  // Save the exact remaining time at the moment of pausing
  sessionData.remainingMs = Math.max(0, endTime - Date.now());
  sessionData.status = "paused";
  sessionData.pauseCount++;

  sessionData.progressPercent =
    100 - (sessionData.remainingMs / (sessionData.duration * 60000)) * 100;

  // Update the interface
  sessionStatusEle.textContent = "paused";
  sessionStatusEle.classList.add("pause");
  pauseBtn.hidden = true;
  resumeBtn.hidden = false;

  displayTime(sessionData.remainingMs);

  blockingActive.hidden = true;
  blockingPaused.hidden = false;

  timerCircle.style.background = `linear-gradient(white) padding-box,
    conic-gradient(var(--muted) ${sessionData.progressPercent}%,
    #dce4e0 0) border-box`;

  // Persist the paused session
  try {
    await modifySession(sessionData);
  } catch (error) {
    console.error("Session paused, but saving failed:", error);
  }
}

// Resume timer
export async function resumeTimer() {
  // Prevent resuming an already active or finished session
  if (sessionData.status !== "paused") return;

  sessionData.status = "active";

  // Update the interface
  sessionStatusEle.textContent = "active";
  sessionStatusEle.classList.remove("pause");
  pauseBtn.hidden = false;
  resumeBtn.hidden = true;

  blockingActive.hidden = false;
  blockingPaused.hidden = true;

  // timer border
  timerCircle.style.background = `linear-gradient(white) padding-box,
  conic-gradient(var(--brand) ${sessionData.progressPercent}%,
  #dce4e0 0) border-box`;

  starterTimer(sessionData.remainingMs / 60000);

  try {
    await modifySession(sessionData);
  } catch (error) {
    console.error("Session resumed, but saving failed:", error);
  }
}
