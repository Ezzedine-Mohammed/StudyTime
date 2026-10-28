import { navigate } from "./navigation.js";
import { sessionData } from "./session.js";

// DOM elements
const historyTab = document.getElementById("history-tab");
const historyScreen = document.getElementById("history-screen");
const summaryScreen = document.getElementById("summary-screen");

const summaryStatus = document.getElementById("summary-session-status");
const summaryTitle = document.getElementById("summary-session-title");
const summaryDate = document.getElementById("session-date");
const summaryStudyTime = document.getElementById("summary-study-time");
const summaryDuration = document.getElementById("summary-duration");
const summaryAttempts = document.getElementById("summary-attempts");
const summaryPauses = document.getElementById("summary-pauses");
const summaryStart = document.getElementById("start-time");
const summaryEnd = document.getElementById("end-time");

const sessionTab = document.getElementById("session-tab");

// Finished session
export function timesUp() {
  displaySummaryData();
  navigate(historyTab);
  historyScreen.hidden = true;
  summaryScreen.hidden = false;
}

function displaySummaryData() {
  summaryStatus.textContent = sessionData.status;
  summaryTitle.textContent = sessionData.title;
  summaryDate.textContent = new Date(sessionData.end).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
  const activeStudy = Math.floor(
    (sessionData.duration * 60 * 1000 - sessionData.remainingMs) / 1000,
  );
  const activeMinutes = Math.floor(activeStudy / 60);
  const activeSeconds = activeStudy % 60;
  summaryStudyTime.textContent = `${String(activeMinutes).padStart(2, "0")}:${String(activeSeconds).padStart(2, "0")} min`;
  summaryDuration.textContent = sessionData.duration + " min";
  summaryAttempts.textContent = sessionData.attempts;
  summaryPauses.textContent = sessionData.pauseCount;
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  summaryStart.textContent = new Date(sessionData.start).toLocaleTimeString(
    "en-US",
    timeOptions,
  );
  summaryEnd.textContent = new Date(sessionData.end).toLocaleTimeString(
    "en-US",
    timeOptions,
  );
}

export function newSession() {
  navigate(sessionTab);
  historyScreen.hidden = false;
  summaryScreen.hidden = true;
  document.getElementById("session-setup").hidden = false;
  document.getElementById("session-active").hidden = true;
}
export function viewHistory() {
  navigate(historyTab);
  historyScreen.hidden = false;
  summaryScreen.hidden = true;
}

export function emptyHistory() {
  navigate(sessionTab);
  historyScreen.hidden = false;
  summaryScreen.hidden = true;
}
