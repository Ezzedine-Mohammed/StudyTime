import { navigate } from "./navigation.js";
import { sessionData } from "./session.js";
import { getAllSessions } from "./sessionRepository.js";

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

const ulList = document.getElementById("history-list");

const notification = document.getElementById("notification");

// Finished session
export function timesUp(session) {
  displaySummaryData(session);
  navigate(historyTab);
}

export function displaySummaryData(session) {
  summaryStatus.textContent = session.status;
  summaryTitle.textContent = session.title;
  summaryDate.textContent = new Date(session.end).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const activeStudy = Math.floor(
    (session.duration * 60 * 1000 - session.remainingMs) / 1000,
  );
  const activeMinutes = Math.floor(activeStudy / 60);
  const activeSeconds = activeStudy % 60;
  summaryStudyTime.textContent = `${String(activeMinutes).padStart(2, "0")}:${String(activeSeconds).padStart(2, "0")} min`;
  summaryDuration.textContent = session.duration + " min";
  summaryAttempts.textContent = session.attempts;
  summaryPauses.textContent = session.pauseCount;
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  summaryStart.textContent = new Date(session.start).toLocaleTimeString(
    "en-US",
    timeOptions,
  );
  summaryEnd.textContent = new Date(session.end).toLocaleTimeString(
    "en-US",
    timeOptions,
  );
  historyScreen.hidden = true;
  summaryScreen.hidden = false;
}

export function newSession() {
  navigate(sessionTab);
  historyScreen.hidden = false;
  summaryScreen.hidden = true;

  if (sessionData.status === "active" || sessionData.status === "paused") {
    notification.hidden = false;
    setTimeout(() => {
      notification.hidden = true;
      console.log("here x2");
    }, 4000);
    return;
  }

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

  if (sessionData.status === "active" || sessionData.status === "paused") {
    notification.hidden = false;
    setTimeout(() => {
      notification.hidden = true;
      console.log("here");
    }, 4000);
    return;
  }

  historyScreen.hidden = false;
  summaryScreen.hidden = true;
}

export async function displaySessions() {
  const sessions = await getAllSessions();
  ulList.innerHTML = "";
  sessions.forEach((session) => {
    const dateFormat = new Date(session.end).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const activeStudy = Math.floor(
      (session.duration * 60 * 1000 - session.remainingMs) / 1000,
    );

    const activeMinutes = Math.floor(activeStudy / 60);
    const activeSeconds = activeStudy % 60;

    const li = document.createElement("li");
    li.className = "summary";

    li.innerHTML = `
    <div class="history-session-title">
      <span class="mask-icon icon-calendar" aria-hidden="true"></span>
      <p dir="auto"></p>
      <p class="history-date helper-text">${dateFormat}</p>
    </div>
    <div>
      <p class="history-study-time">
        ${String(activeMinutes).padStart(2, "0")}:${String(activeSeconds).padStart(2, "0")} min
      </p>
      <p class="history-ending-status"></p>
      <button type="button" title="summary" class="summary-btn">
        View summary
      </button>
    </div>
    `;

    li.querySelector(".history-session-title > p").textContent = session.title;

    li.querySelector(".history-ending-status").textContent = session.status;

    // Keep the same dataset key used by your current listener
    li.querySelector(".summary-btn").dataset.sessionid = session.id;

    ulList.append(li);
  });
}
