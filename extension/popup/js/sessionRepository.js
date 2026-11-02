import { db } from "./db.js";
import { requestSitePermission, removeSitePermission } from "./permission.js";

// Add a session and return its generated ID
export async function addSession(session) {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("sessions", "readwrite");
    const store = transaction.objectStore("sessions");
    const request = store.add(session);

    // The entire transaction completed successfully
    transaction.oncomplete = () => {
      resolve(request.result);
    };

    // The transaction failed and its changes were rolled back
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Could not save the session."));
    };
  });
}

// Read completed and early-ended sessions in descending ID order
export async function getAllSessions() {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("sessions", "readonly");
    const store = transaction.objectStore("sessions");
    const request = store.getAll();

    transaction.oncomplete = () => {
      resolve(
        request.result
          .filter(
            (session) =>
              session.status === "Completed" ||
              session.status === "Ended early",
          )
          .reverse(),
      );
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Could not read sessions."));
    };
  });
}

// get session using id
export async function getSession(id) {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("sessions", "readonly");
    const store = transaction.objectStore("sessions");
    const request = store.get(id);

    transaction.oncomplete = () => {
      resolve(request.result);
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Could not read the session"));
    };
  });
}

// Save the updated session
export async function modifySession(session) {
  const database = await db;

  if (session.id == null) {
    throw new Error("Session ID is required.");
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("sessions", "readwrite");
    const store = transaction.objectStore("sessions");
    store.put(session);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Could not update the session."));
    };
  });
}

// check if a domain already in blockedSites
async function checkDomain(domain) {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("blockedSites", "readonly");
    const store = transaction.objectStore("blockedSites");
    const request = store.get(domain);

    // request.onsuccess;
    transaction.oncomplete = () => {
      resolve(Boolean(request.result));
    };

    // request.onerror;
    transaction.onabort = () => {
      reject(request.error ?? new Error("Failed to check domain in database"));
    };
  });
}

// add site domain to database if it's not in there
export async function addSiteToBlockedSites(domain) {
  const permissionResult = await requestSitePermission(domain);

  // if the user denied the permission
  if (!permissionResult.status) {
    return { added: false, reason: "permission_denied" };
  }

  // format the domain to (youtube.com)
  const cleanDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0];

  // check if the domain already in the database or not
  const exists = await checkDomain(cleanDomain);
  if (exists) {
    return { added: false, reason: "already_exists" };
  }

  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("blockedSites", "readwrite");
    const store = transaction.objectStore("blockedSites");

    const siteRecord = {
      domain: cleanDomain,
      isSelected: true,
    };

    store.add(siteRecord);

    transaction.oncomplete = () => {
      resolve({ added: true, site: siteRecord });
    };

    transaction.onabort = () => {
      reject(
        transaction.error ?? new Error("Could not save domain to database"),
      );
    };
  });
}

export async function getDomains() {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("blockedSites", "readonly");
    const store = transaction.objectStore("blockedSites");
    const request = store.getAll();

    transaction.oncomplete = () => {
      resolve(request.result);
    };

    transaction.onabort = () => {
      reject(
        transaction.error ?? new Error("Could not get blocked sites domain"),
      );
    };
  });
}

export async function removeSiteDB(domain) {
  try {
    const exists = await checkDomain(domain);

    if (!exists) {
      throw new Error("the site is not saved in the data base");
    }

    const database = await db;

    await new Promise((resolve, reject) => {
      const transaction = database.transaction("blockedSites", "readwrite");
      const store = transaction.objectStore("blockedSites");
      store.delete(domain);

      transaction.oncomplete = () => {
        resolve(true);
      };

      transaction.onabort = () => {
        reject(
          transaction.error ??
            new Error("Removing from blocked sites table process failed"),
        );
      };
    });

    const process = await removeSitePermission(domain);

    if (!process.status) {
      // the site is already removed from the db, so don't fail the whole operation
      console.warn("the site had no permission to remove", process.domain);
    }

    return true;
  } catch (error) {
    console.error(
      "an error occurred from session repository while trying to remove site from database",
      error,
    );
    return false;
  }
}

export async function toggleSelect(domain) {
  const database = await db;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("blockedSites", "readwrite");
    const store = transaction.objectStore("blockedSites");
    const request = store.get(domain);
    request.onsuccess = () => {
      const result = request.result;
      result.isSelected = !result.isSelected;
      store.put(result);
    };

    transaction.oncomplete = () => {
      resolve(request.result?.isSelected);
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Could not fetch the domain"));
    };
  });
}
