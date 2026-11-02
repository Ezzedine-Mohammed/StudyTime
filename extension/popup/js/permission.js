import { api } from "../../utils/browser-api.js";

// convert the domain and subdomain to the required format
export function formatOriginPattern(domain) {
  if (domain.startsWith("*://*.")) return domain;

  const cleanDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0];
  return `*://*.${cleanDomain}/*`;
}

// check if there is a permission for specific domain
export async function hasSitePermission(domain) {
  const originPattern = formatOriginPattern(domain);
  return await api.permissions.contains({
    origins: [originPattern],
  });
}

// ask for website permission
export async function requestSitePermission(domain) {
  const originPattern = formatOriginPattern(domain);

  const granted = await api.permissions.request({
    origins: [originPattern],
  });

  return {
    status: granted,
    domain: originPattern,
  };
}

// remove permission from specific domain
export async function removeSitePermission(domain) {
  const originPattern = formatOriginPattern(domain);
  const isGranted = await hasSitePermission(originPattern);
  let removed = false;

  if (isGranted) {
    removed = await api.permissions.remove({
      origins: [originPattern],
    });
  }

  return {
    status: removed,
    domain: originPattern,
  };
}
