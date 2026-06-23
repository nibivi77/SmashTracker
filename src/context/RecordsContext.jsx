import { createContext, useContext, useEffect, useState } from "react";
import { useIndexedDB } from "../hooks/useIndexedDB";

const RecordsContext = createContext();

export function RecordsProvider({ children }) {
  const {
    saveRecord: dbSaveRecord,
    getAllRecords,
    deleteRecord: dbDeleteRecord,
    getRecord,
    dbReady
  } = useIndexedDB();

  const [records, setRecords] = useState([]);

  // Load records when DB is ready
  useEffect(() => {
    if (!dbReady) return;
    getAllRecords().then(setRecords);
  }, [dbReady]);

  // Save or overwrite record
  const saveRecord = async (record) => {
    await dbSaveRecord(record);

    setRecords((prev) => {
      const filtered = prev.filter(
        (r) => r.duoKey !== record.duoKey
      );
      return [...filtered, record];
    });
  };

  // Delete record
  const deleteRecord = async (duoKey) => {
    await dbDeleteRecord(duoKey);

    setRecords((prev) =>
      prev.filter((r) => r.duoKey !== duoKey)
    );
  };

  return (
    <RecordsContext.Provider
      value={{
        records,
        saveRecord,
        deleteRecord,
        getRecord,
        dbReady
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  return useContext(RecordsContext);
}