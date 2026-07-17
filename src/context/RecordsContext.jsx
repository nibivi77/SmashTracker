import { createContext, useContext, useEffect, useState } from "react";
import { DATA_VERSION, STORAGE_KEY } from "../data/schema";
import { createDuoKey } from "../utils/duoKey";

const RecordsContext = createContext();

function normalizeRecordsData(parsed) {
  let records = [];

  if (Array.isArray(parsed)) {
    records = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.records)
  ) {
    records = parsed.records;
  }

  // Normalize each record
  const normalizedRecords = records.map((record) => {
    const p1Player = record.p1Player || "ben";
    const p2Player = record.p2Player || "oli";

    // Regenerate canonical duoKey
    const canonicalDuoKey =
      record.p1Character && record.p2Character
        ? createDuoKey(record.p1Character, record.p2Character)
        : record.duoKey;

    return {
      ...record,
      p1Player,
      p2Player,
      duoKey: canonicalDuoKey
    };
  });

  // Deduplicate by duoKey, keeping the best ratio
  const recordMap = new Map();

  for (const record of normalizedRecords) {
    const existing = recordMap.get(record.duoKey);

    if (!existing) {
      recordMap.set(record.duoKey, record);
    } else {
      // Keep the one with better ratio
      const existingRatio = getSimpleTeamRatio(existing);
      const newRatio = getSimpleTeamRatio(record);

      if (newRatio > existingRatio) {
        recordMap.set(record.duoKey, record);
      }
    }
  }

  return {
    version: DATA_VERSION,
    records: Array.from(recordMap.values())
  };
}

function getSimpleTeamRatio(record) {
  const dealt =
    Number(record.p1DamageGiven) + Number(record.p2DamageGiven);
  const taken =
    Number(record.p1DamageTaken) + Number(record.p2DamageTaken);

  return taken > 0 ? dealt / taken : Infinity;
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
    const normalized = normalizeRecordsData({ records: nextRecords });
    setRecords(normalized.records);
    saveRecordsDataToStorage(normalized.records);
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
