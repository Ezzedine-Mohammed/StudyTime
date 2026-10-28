import { db } from "./db.js";

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
