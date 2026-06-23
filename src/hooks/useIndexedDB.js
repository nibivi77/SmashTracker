import { useEffect, useState } from "react";

export function useIndexedDB() {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // indexedDB.deleteDatabase("smash-duo-tracker");
    const request = indexedDB.open("smash-duo-tracker", 1);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains("records")) {
        database.createObjectStore("records", {
          keyPath: "duoKey",
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

  // Add a record
  const saveRecord = (record) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("records", "readwrite");
      const store = tx.objectStore("records");
      const request = store.put(record);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  // Get a specific record by duoKey
  const getRecord = (duoKey) =>
    new Promise((resolve, reject) => {
    const tx = db.transaction("records", "readonly");
    const store = tx.objectStore("records");

    const request = store.get(duoKey);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Get all records
  const getAllRecords = () =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("records", "readonly");
      const store = tx.objectStore("records");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  // Delete a record
  const deleteRecord = (id) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction("records", "readwrite");
      const store = tx.objectStore("records");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

  return { saveRecord, getAllRecords, deleteRecord, getRecord, dbReady };
}