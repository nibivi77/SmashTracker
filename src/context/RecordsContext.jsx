import { createContext, useContext, useEffect, useState } from "react";
import { onValue, ref, remove, set } from "firebase/database";
import { db } from "../firebaseConfig";
import { DATA_VERSION, STORAGE_KEY } from "../data/schema";
import { createDuoKey } from "../utils/duoKey";
import { normalizeImportedData, validateImportedRecords } from "../utils/importValidation";

const RecordsContext = createContext();

const RECORDS_PATH = "records";

function getSimpleTeamRatio(record) {
  const dealt =
    Number(record.p1DamageGiven) + Number(record.p2DamageGiven);
  const taken =
    Number(record.p1DamageTaken) + Number(record.p2DamageTaken);

  return taken > 0 ? dealt / taken : Infinity;
}

// Keeps the better-ratio record per duoKey. Firebase records are already
// unique by duoKey (that's the RTDB key itself), so this only matters for
// the local Import-JSON path, where a hand-edited file could contain
// accidental duplicates.
function dedupeRecordsByDuoKey(records) {
  const recordMap = new Map();

  for (const record of records) {
    const existing = recordMap.get(record.duoKey);

    if (!existing || getSimpleTeamRatio(record) > getSimpleTeamRatio(existing)) {
      recordMap.set(record.duoKey, record);
    }
  }

  return Array.from(recordMap.values());
}

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

  return {
    version: DATA_VERSION,
    records: dedupeRecordsByDuoKey(normalizedRecords)
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

// The database is publicly writable, so a buggy or malicious client could
// push malformed data directly via the API — this is the trust boundary
// that stops that from ever corrupting the UI or localStorage.
function extractTrustedRecords(snapshotValue) {
  const recordsArray = Object.values(snapshotValue || {});
  const normalized = normalizeImportedData(recordsArray);

  if (!normalized) {
    throw new Error("Remote data is not a recognizable records format.");
  }

  const validationError = validateImportedRecords(normalized.records);

  if (validationError) {
    throw new Error(`Remote data failed validation: ${validationError}`);
  }

  return normalized.records;
}

function toKeyedObject(records) {
  return Object.fromEntries(records.map((record) => [record.duoKey, record]));
}

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    const loaded = loadRecordsData();
    setRecords(loaded.records);
  }, []);

  // One persistent subscription — every save/delete from any device (this
  // one included, since Firebase echoes local writes back immediately)
  // flows through here, so this is the only place `records` ever gets set
  // from remote data.
  useEffect(() => {
    const recordsRef = ref(db, RECORDS_PATH);

    const unsubscribe = onValue(
      recordsRef,
      (snapshot) => {
        try {
          const trustedRecords = extractTrustedRecords(snapshot.val());
          setRecords(trustedRecords);
          saveRecordsDataToStorage(trustedRecords);
          setLastUpdatedAt(Date.now());
        } catch (error) {
          console.error("Ignoring invalid data from Firebase:", error);
        }
      },
      (error) => {
        console.error("Firebase records listener failed:", error);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return unsubscribe;
  }, []);

  const saveRecord = (record) => {
    set(ref(db, `${RECORDS_PATH}/${record.duoKey}`), record).catch((error) => {
      console.error("Failed to save record to Firebase:", error);
    });
  };

  const deleteRecord = (duoKey) => {
    remove(ref(db, `${RECORDS_PATH}/${duoKey}`)).catch((error) => {
      console.error("Failed to delete record from Firebase:", error);
    });
  };

  const importRecords = (nextRecords) => {
    const normalized = normalizeRecordsData({ records: nextRecords });

    set(ref(db, RECORDS_PATH), toKeyedObject(normalized.records)).catch((error) => {
      console.error("Failed to import records to Firebase:", error);
    });
  };

  const getRecord = (duoKey) => {
    return records.find((r) => r.duoKey === duoKey) || null;
  };

  const clearAllRecords = () => {
    set(ref(db, RECORDS_PATH), null).catch((error) => {
      console.error("Failed to clear records in Firebase:", error);
    });
  };

  return (
    <RecordsContext.Provider
      value={{
        records,
        saveRecord,
        deleteRecord,
        importRecords,
        getRecord,
        clearAllRecords,
        isConnected,
        lastUpdatedAt
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  return useContext(RecordsContext);
}
