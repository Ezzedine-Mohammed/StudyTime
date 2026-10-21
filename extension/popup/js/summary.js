import { navigate } from "./navigation.js";

// DOM elements
const historyBtn = document.getElementById("history-btn");
const historyScreen = document.getElementById("history-screen");
const summaryScreen = document.getElementById("summary-screen");

// Finished session
export function timesUp() {
  navigate(historyBtn);
  console.log("timesUp");
  historyScreen.hidden = true;
  summaryScreen.hidden = false;
}
