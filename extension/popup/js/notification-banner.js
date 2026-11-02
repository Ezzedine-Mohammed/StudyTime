const notificationEle = document.getElementById("notification");
const notificationText = document.getElementById("notification-text");

export function notification(text) {
  clearTimeout(hideTime);
  notificationText.textContent = text;

  notificationEle.hidden = false;

  hideTime = setTimeout(() => {
    notificationEle.hidden = true;
  }, 4000);
}
