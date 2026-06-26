import { createContext, useContext, useEffect, useState } from "react";
import { DATA_VERSION, STORAGE_KEY } from "../data/schema";

const RecordsContext = createContext();

function normalizeRecordsData(parsed) {
  if (Array.isArray(parsed)) {
    return {
      version: DATA_VERSION,
      records: parsed
    };
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.records)
  ) {
    return {
      version:
        typeof parsed.version === "number" ? parsed.version : DATA_VERSION,
      records: parsed.records
    };
  }

  return {
    version: DATA_VERSION,
    records: []
  };
}

function loadRecordsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        version: DATA_VERSION,
        records: []
      };
    }

    const parsed = JSON.parse(raw);
    return normalizeRecordsData(parsed);
  } catch (error) {
    console.error("Failed to load records from localStorage:", error);
    return {
      version: DATA_VERSION,
      records: []
    };
  }
}

function saveRecordsDataToStorage(records) {
  try {
    const payload = {
      version: DATA_VERSION,
      records
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save records to localStorage:", error);
  }
}

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loaded = loadRecordsData();
    setRecords(loaded.records);
  }, []);

  const saveRecord = (record) => {
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.duoKey !== record.duoKey);
      const updated = [...filtered, record];
      saveRecordsDataToStorage(updated);
      return updated;
    });
  };

  const deleteRecord = (duoKey) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.duoKey !== duoKey);
      saveRecordsDataToStorage(updated);
      return updated;
    });
  };

  const importRecords = (nextRecords) => {
    setRecords(nextRecords);
    saveRecordsDataToStorage(nextRecords);
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
        importRecords,
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
