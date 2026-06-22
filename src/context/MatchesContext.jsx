import { createContext, useContext, useEffect, useState } from "react";
import { useIndexedDB } from "../hooks/useIndexedDB";

const MatchesContext = createContext();

export function MatchesProvider({ children }) {
  const { addItem, getAllItems, deleteItem, dbReady } = useIndexedDB();
  const [matches, setMatches] = useState([]);

  // Load matches when DB is ready
  useEffect(() => {
    if (!dbReady) return;
    getAllItems().then(setMatches);
  }, [dbReady]);

  const addMatch = async (match) => {
    const id = await addItem(match);
    setMatches((prev) => [...prev, { ...match, id }]);
  };

  const removeMatch = async (id) => {
    await deleteItem(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <MatchesContext.Provider value={{ matches, addMatch, removeMatch, dbReady }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  return useContext(MatchesContext);
}