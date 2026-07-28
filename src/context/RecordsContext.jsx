import { createContext, useContext, useEffect, useState } from "react";
import { DATA_VERSION, STORAGE_KEY } from "../data/schema";
import { GIST_LAST_SYNCED_STORAGE_KEY } from "../data/gistSyncSchema";
import { createDuoKey } from "../utils/duoKey";
import { normalizeImportedData, validateImportedRecords } from "../utils/importValidation";
import { describeGistError, fetchGistFile, updateGistFile } from "../api/githubGist";

const RecordsContext = createContext();

function getSimpleTeamRatio(record) {
  const dealt =
    Number(record.p1DamageGiven) + Number(record.p2DamageGiven);
  const taken =
    Number(record.p1DamageTaken) + Number(record.p2DamageTaken);

  return taken > 0 ? dealt / taken : Infinity;
}

// Keeps the better-ratio record per duoKey, regardless of which source
// (local storage, an imported file, or the shared gist) each one came from.
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

// Baked into the build via .env.local — every device (including a friend's,
// who never touches Settings) shares the same gist with no manual setup.
const GIST_TOKEN = import.meta.env.VITE_DEFAULT_GIST_TOKEN || "";
const GIST_ID = import.meta.env.VITE_DEFAULT_GIST_ID || "";

function loadLastSyncedAt() {
  try {
    const raw = localStorage.getItem(GIST_LAST_SYNCED_STORAGE_KEY);
    const parsed = raw ? Number(raw) : null;
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to load last-synced time from localStorage:", error);
    return null;
  }
}

// Extracts remote records from a gist's records.json content, running them
// through the same normalize/dedupe/validate pipeline used for manual JSON
// imports so a malformed or tampered gist can never corrupt local data.
function extractTrustedRecords(rawContent) {
  const normalized = normalizeImportedData(rawContent);

  if (!normalized) {
    throw new Error("Gist file is not a recognizable records format.");
  }

  const deduped = dedupeRecordsByDuoKey(normalized.records);
  const validationError = validateImportedRecords(deduped);

  if (validationError) {
    throw new Error(`Gist data failed validation: ${validationError}`);
  }

  return deduped;
}

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);

  const [lastSyncedAt, setLastSyncedAt] = useState(loadLastSyncedAt);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState(null);

  const isSyncConfigured = Boolean(GIST_TOKEN && GIST_ID);

  useEffect(() => {
    const loaded = loadRecordsData();
    setRecords(loaded.records);
  }, []);

  useEffect(() => {
    try {
      if (lastSyncedAt) {
        localStorage.setItem(GIST_LAST_SYNCED_STORAGE_KEY, String(lastSyncedAt));
      } else {
        localStorage.removeItem(GIST_LAST_SYNCED_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to persist last-synced time:", error);
    }
  }, [lastSyncedAt]);

  // Fires once on mount, after the synchronous local-load effect above has
  // already populated `records` — so there's never a flash of empty state,
  // and if this fails/there's no signal, whatever localStorage had stays put.
  useEffect(() => {
    if (isSyncConfigured) {
      pullFromGist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merges with whatever is already in local state/storage rather than
  // overwriting it outright — a device that already has pre-existing
  // local-only records (e.g. from before gist sync existed) would otherwise
  // silently lose them the first time this runs. Uses the functional
  // setRecords form so it always merges against the truly-current local
  // state, not a possibly-stale closure value from an earlier render.
  async function pullFromGist() {
    if (!isSyncConfigured) {
      return;
    }

    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const result = await fetchGistFile({ gistId: GIST_ID, token: GIST_TOKEN });

      if (result.exists) {
        const remoteRecords = extractTrustedRecords(result.content);

        setRecords((prev) => {
          const merged = dedupeRecordsByDuoKey([...remoteRecords, ...prev]);
          saveRecordsDataToStorage(merged);
          return merged;
        });
      }

      setLastSyncedAt(Date.now());
      setSyncStatus("success");
    } catch (error) {
      console.error("Gist pull failed:", error);
      setSyncStatus("error");
      setSyncError(describeGistError(error));
    }
  }

  // Reconciles with whatever is currently on the gist before writing, rather
  // than blindly overwriting it with this device's local snapshot. With 3
  // independent people saving at different times (not always together), a
  // blind overwrite from a stale device could erase records someone else
  // already synced. Merging via dedupeRecordsByDuoKey (the same "keep the
  // better ratio per duoKey" rule already used everywhere else) means an
  // update to one duoKey never clobbers a concurrent update to another, and
  // a genuine same-duoKey race just keeps whichever result is better.
  async function pushToGist(recordsToPush, { deletedDuoKeys = [], replaceRemote = false } = {}) {
    if (!isSyncConfigured) {
      return;
    }

    setSyncStatus("syncing");
    setSyncError(null);

    try {
      let merged = recordsToPush;

      if (!replaceRemote) {
        const remoteResult = await fetchGistFile({ gistId: GIST_ID, token: GIST_TOKEN });
        const remoteRecords = remoteResult.exists ? extractTrustedRecords(remoteResult.content) : [];
        merged = dedupeRecordsByDuoKey([...remoteRecords, ...recordsToPush]);

        if (deletedDuoKeys.length > 0) {
          merged = merged.filter((r) => !deletedDuoKeys.includes(r.duoKey));
        }
      }

      await updateGistFile({
        gistId: GIST_ID,
        token: GIST_TOKEN,
        content: { version: DATA_VERSION, records: merged }
      });

      // Reconcile local state too, in case remote had records this device
      // didn't have yet (e.g. a friend's save this device never pulled).
      setRecords(merged);
      saveRecordsDataToStorage(merged);
      setLastSyncedAt(Date.now());
      setSyncStatus("success");
    } catch (error) {
      console.error("Gist push failed:", error);
      setSyncStatus("error");
      setSyncError(describeGistError(error));
    }
  }

  const saveRecord = (record) => {
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.duoKey !== record.duoKey);
      const updated = [...filtered, record];
      saveRecordsDataToStorage(updated);
      pushToGist(updated);
      return updated;
    });
  };

  const deleteRecord = (duoKey) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.duoKey !== duoKey);
      saveRecordsDataToStorage(updated);
      pushToGist(updated, { deletedDuoKeys: [duoKey] });
      return updated;
    });
  };

  const importRecords = (nextRecords) => {
    const normalized = normalizeRecordsData({ records: nextRecords });
    setRecords(normalized.records);
    saveRecordsDataToStorage(normalized.records);
    pushToGist(normalized.records, { replaceRemote: true });
  };

  const getRecord = (duoKey) => {
    return records.find((r) => r.duoKey === duoKey) || null;
  };

  const clearAllRecords = () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
    pushToGist([], { replaceRemote: true });
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
        isSyncConfigured,
        syncStatus,
        syncError,
        lastSyncedAt,
        syncNow: pullFromGist
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  return useContext(RecordsContext);
}
