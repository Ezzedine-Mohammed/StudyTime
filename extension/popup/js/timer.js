import { sessionData } from "./session.js";
import { timesUp } from "./summary.js";

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

// Timer variables
let timer = null;
let endTime = 0;
let percent = 0;

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
  sessionData.remainingMs = duration * 60 * 1000;
  endTime = Date.now() + sessionData.remainingMs;

  displayTime(sessionData.remainingMs);

  timer = setInterval(() => {
    sessionData.remainingMs = Math.max(0, endTime - Date.now());
    displayTime(sessionData.remainingMs);

    // percent of the studded time
    const totalMs = sessionData.duration * 60 * 1000;

    percent = 100 - (sessionData.remainingMs / totalMs) * 100;

    // timer border
    timerCircle.style.background = `linear-gradient(white) padding-box,
        conic-gradient(var(--brand) ${percent}%,
            #dce4e0 0) border-box`;

    if (sessionData.remainingMs === 0) {
      sessionData.end = Date.now();
      sessionData.status = "Completed";
      timesUp();
      clearInterval(timer);
      // Handle session completion here later
    }
  }, 1000);
}

// Pause timer
export function pauseTimer() {
  // Save the exact remaining time at the moment of pausing
  sessionData.remainingMs = Math.max(0, endTime - Date.now());
  clearInterval(timer);

  sessionStatusEle.textContent = "paused";
  sessionStatusEle.classList.add("pause");
  pauseBtn.hidden = true;
  resumeBtn.hidden = false;
  sessionData.pauseCount++;
  blockingActive.hidden = true;
  blockingPaused.hidden = false;

  // change timer border color
  timerCircle.style.background = `linear-gradient(white) padding-box,
        conic-gradient(var(--muted) ${percent}%,
            #dce4e0 0) border-box`;
}

// Resume timer
export function resumeTimer() {
  sessionStatusEle.textContent = "active";
  sessionStatusEle.classList.remove("pause");
  pauseBtn.hidden = false;
  resumeBtn.hidden = true;
  blockingActive.hidden = false;
  blockingPaused.hidden = true;

  // timer border
  timerCircle.style.background = `linear-gradient(white) padding-box,
        conic-gradient(var(--brand) ${percent}%,
            #dce4e0 0) border-box`;

  starterTimer(sessionData.remainingMs / 60000);
}
