import { notification } from "./notification-banner.js";
import {
  addSiteToBlockedSites,
  getDomains,
  removeSiteDB,
  toggleSelect,
} from "./sessionRepository.js";

import { api } from "../../utils/browser-api.js";
import { formatOriginPattern } from "./permission.js";

// variables
let isSubmitting = false;
let knownDomains = new Set();

// user messages for each reason returned from addSiteToBlockedSites
const addSiteMessages = {
  permission_denied: "Permission is required to block this website.",
  already_exists: "This website is already in your block list.",
};

// dom elements
const siteForm = document.getElementById("site-form");
const siteList = document.getElementById("site-list");

//

//check the domain is valid or not, and format the domain for saving in database
export function validateAndExtractDomain(input) {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  try {
    const urlString = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
    const parsedUrl = new URL(urlString);

    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

    return domainRegex.test(hostname) ? hostname : null;
  } catch {
    return null;
  }
}

export async function toggleSite(btn) {
  const domain = btn.dataset.domain;
  try {
    const isSelected = await toggleSelect(domain);
    btn.classList.toggle("off", !isSelected);
    btn.setAttribute("aria-checked", String(isSelected));
  } catch (error) {
    console.error(`error occurred while toggling the site select ${error}`);
  }
}

export async function displaySiteList() {
  try {
    const domains = await getDomains();
    siteList.innerHTML = "";
    domains.forEach((domain) => {
      siteList.innerHTML += `
      <li class="domain">
            <div>
              <i class="fa-solid fa-globe"></i>
              <p class="domain-text">${domain.domain}</p>
            </div>
            <div>
              <button
                type="button"
                class="toggle-btn ${domain.isSelected ? "" : "off"}"
                role="switch"
                aria-checked="${String(domain.isSelected)}"
                aria-label="active website blocking"
                data-domain = "${domain.domain}"
              >
                <span class="" aria-hidden="true"></span>
              </button>
              <button
                type="button"
                class="remove-domain"
                aria-label="remove website domain"
                data-domain = "${domain.domain}"
              >
                <i class="fa-solid fa-trash trash-icon" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        `;
    });
  } catch (error) {
    notification("error occurred while displaying the domains");
    console.error(`error occurred while displaying the domains: ${error}`);
  }
}

export async function removeSite(removeBtn) {
  const domain = removeBtn.dataset.domain;

  try {
    const removed = await removeSiteDB(domain);

    if (!removed) {
      throw new Error("error while trying to remove site from site.js");
    }
  } catch (error) {
    console.error(`caught error in site.js ${error}`);
  } finally {
    await displaySiteList();
  }
}

siteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  const domainInput = siteForm.elements["domain-input"].value;

  const domain = validateAndExtractDomain(domainInput);

  if (!domain) {
    notification("Please enter a valid url.");
    return;
  }

  isSubmitting = true;

  try {
    const saved = await addSiteToBlockedSites(domain);

    if (saved.added) {
      await displaySiteList();
    } else {
      notification(addSiteMessages[saved.reason] ?? "Could not add the website.");
    }
  } catch (error) {
    notification("Could not add the website.");
    console.error("An error occurred:", error);
  } finally {
    isSubmitting = false;
    siteForm.reset();
  }
});
