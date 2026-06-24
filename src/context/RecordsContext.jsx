import { createContext, useContext, useEffect, useState } from "react";

const RecordsContext = createContext();

const STORAGE_KEY = "smashtracker-records";

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load records from localStorage:", error);
    return [];
  }
}

function saveRecordsToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save records to localStorage:", error);
  }
}

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const saveRecord = (record) => {
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.duoKey !== record.duoKey);
      const updated = [...filtered, record];
      saveRecordsToStorage(updated);
      return updated;
    });
  };

  const deleteRecord = (duoKey) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.duoKey !== duoKey);
      saveRecordsToStorage(updated);
      return updated;
    });
  };

  const getRecord = (duoKey) => {
    return records.find((r) => r.duoKey === duoKey) || null;
  };

  const clearAllRecords = () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RecordsContext.Provider
      value={{
        records,
        saveRecord,
        deleteRecord,
        getRecord,
        clearAllRecords
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  return useContext(RecordsContext);
}
