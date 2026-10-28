export const db = new Promise((resolve, reject) => {
  const request = indexedDB.open("StudyTime", 1);

  // Create or upgrade the database structure
  request.onupgradeneeded = () => {
    const db = request.result;

    // Sessions
    if (!db.objectStoreNames.contains("sessions")) {
      db.createObjectStore("sessions", {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    // User preferences
    if (!db.objectStoreNames.contains("settings")) {
      const settingsStore = db.createObjectStore("settings", {
        keyPath: "id",
      });

      settingsStore.add({
        id: "preferences",
        blockNotifications: false,
      });
    }

    // Website restriction list
    if (!db.objectStoreNames.contains("blockedSites")) {
      db.createObjectStore("blockedSites", {
        keyPath: "domain",
      });
    }

    // Notification exceptions
    if (!db.objectStoreNames.contains("notificationExceptions")) {
      db.createObjectStore("notificationExceptions", {
        keyPath: "domain",
      });
    }

    // Blocked-site access attempts
    if (!db.objectStoreNames.contains("blockedAttempts")) {
      const attemptsStore = db.createObjectStore("blockedAttempts", {
        keyPath: "id",
        autoIncrement: true,
      });

      attemptsStore.createIndex("sessionId", "sessionId", {
        unique: false,
      });
    }
  };

  // Database opened successfully
  request.onsuccess = () => {
    const db = request.result;

    // while a user using the DB and their was an update or change in it, the db connection will be closed
    db.onversionchange = () => {
      db.close();
      console.warn("Database changed. Reload this page.");
    };

    resolve(db);
  };

  // Database opening failed
  request.onerror = () => {
    reject(request.error);
  };

  // Another open connection is preventing an upgrade
  request.onblocked = () => {
    console.warn(
      "Close other open project pages to allow the database upgrade.",
    );
  };
});
