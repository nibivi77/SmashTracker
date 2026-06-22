import { useEffect, useState } from "react";

export function useIndexedDB() {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const request = indexedDB.open("smash-duo-tracker", 1);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains("matches")) {
        database.createObjectStore("matches", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      setDb(event.target.result);
      setDbReady(true);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
    };
  }, []);

  // Add a match
  const addItem = (match) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("matches", "readwrite");
      const store = tx.objectStore("matches");
      const request = store.add(match);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  // Get all matches
  const getAllItems = () =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("matches", "readonly");
      const store = tx.objectStore("matches");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  // Delete a match
  const deleteItem = (id) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("matches", "readwrite");
      const store = tx.objectStore("matches");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

  return { addItem, getAllItems, deleteItem, dbReady };
}