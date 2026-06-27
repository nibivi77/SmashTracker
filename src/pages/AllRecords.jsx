import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterAutocomplete from "../components/CharacterAutocomplete";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import RecordCard from "../components/RecordCard";
import { getTeamRatio } from "../utils/calculations";

export default function AllRecords() {
  const { records, deleteRecord } = useRecords();

  const [p1Query, setP1Query] = useState("");
  const [p2Query, setP2Query] = useState("");
  const [selectedP1, setSelectedP1] = useState(null);
  const [selectedP2, setSelectedP2] = useState(null);

  const [sortBy, setSortBy] = useState("ratio");
  const [sortDirection, setSortDirection] = useState("desc");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const hasActiveDuoFilter = Boolean(selectedP1 && selectedP2);
  const hasCustomSort = sortBy !== "ratio" || sortDirection !== "desc";
  const hasActiveControls = hasActiveDuoFilter || hasCustomSort;

  const visibleRecords = useMemo(() => {
    const filteredRecords =
      !selectedP1 || !selectedP2
        ? records
        : records.filter(
            (record) =>
              record.p1Character === selectedP1.id &&
              record.p2Character === selectedP2.id
          );

    const sortedRecords = [...filteredRecords].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "ratio") {
        comparison = getTeamRatio(a) - getTeamRatio(b);
      }

      if (sortBy === "date") {
        const aTimestamp = a.timestamp ?? 0;
        const bTimestamp = b.timestamp ?? 0;
        comparison = aTimestamp - bTimestamp;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sortedRecords;
  }, [records, selectedP1, selectedP2, sortBy, sortDirection]);

  function handleP1QueryChange(value) {
    setP1Query(value);
    setSelectedP1(null);
  }

  function handleP2QueryChange(value) {
    setP2Query(value);
    setSelectedP2(null);
  }

  function handleSelectP1(character) {
    setSelectedP1(character);
    setP1Query(character.name);
  }

  function handleSelectP2(character) {
    setSelectedP2(character);
    setP2Query(character.name);
  }

  function clearControls() {
    setP1Query("");
    setP2Query("");
    setSelectedP1(null);
    setSelectedP2(null);
    setSortBy("ratio");
    setSortDirection("desc");
    setIsSearchOpen(false);
    setIsSortOpen(false);
  }

  function getSortStatusText() {
    const sortLabel = sortBy === "ratio" ? "Ratio" : "Date";
    const directionLabel = sortDirection === "desc" ? "Desc" : "Asc";
    return `${sortLabel} / ${directionLabel}`;
  }

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  return (
    <Panel title="Saved Records">
      <div className="records-toolbar">
        <div className="records-toolbar-top">
          <p className="records-count">
            <strong>{visibleRecords.length}</strong> of <strong>{records.length}</strong> record{records.length === 1 ? "" : "s"}
          </p>

          <div className="records-toolbar-actions">
            <button
              type="button"
              className={`toolbar-pill ${isSearchOpen ? "active" : ""}`}
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                if (!isSearchOpen) {
                  setIsSortOpen(false);
                }
              }}
              aria-pressed={isSearchOpen}
            >
              Find Duo
            </button>

            <button
              type="button"
              className={`toolbar-pill ${isSortOpen ? "active" : ""}`}
              onClick={() => {
                setIsSortOpen((prev) => !prev);
                if (!isSortOpen) {
                  setIsSearchOpen(false);
                }
              }}
              aria-pressed={isSortOpen}
            >
              Sort
            </button>

            {hasActiveControls && (
              <button
                type="button"
                className="toolbar-pill toolbar-pill-clear"
                onClick={clearControls}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {(hasActiveDuoFilter || hasCustomSort) && (
          <div className="records-status-chips">
            {hasActiveDuoFilter && (
              <span className="status-chip">
                Duo: {selectedP1.name} + {selectedP2.name}
              </span>
            )}

            <span className="status-chip">
              Sort: {getSortStatusText()}
            </span>
          </div>
        )}

        {isSearchOpen && (
          <div className="toolbar-drawer">
            <div className="toolbar-drawer-grid">
              <CharacterAutocomplete
                label="Player 1 Character"
                placeholder="Type Player 1 character..."
                query={p1Query}
                selectedCharacter={selectedP1}
                onQueryChange={handleP1QueryChange}
                onSelectCharacter={handleSelectP1}
              />

              <CharacterAutocomplete
                label="Player 2 Character"
                placeholder="Type Player 2 character..."
                query={p2Query}
                selectedCharacter={selectedP2}
                onQueryChange={handleP2QueryChange}
                onSelectCharacter={handleSelectP2}
              />
            </div>
          </div>
        )}

        {isSortOpen && (
          <div className="toolbar-drawer">
            <div className="sort-toggle-stack">
              <div className="compact-toggle-group">
                <span className="compact-toggle-label">Sort By</span>

                <div className="compact-toggle-buttons">
                  <button
                    type="button"
                    className={`compact-toggle-button ${sortBy === "ratio" ? "active" : ""}`}
                    onClick={() => setSortBy("ratio")}
                    aria-pressed={sortBy === "ratio"}
                  >
                    Ratio
                  </button>

                  <button
                    type="button"
                    className={`compact-toggle-button ${sortBy === "date" ? "active" : ""}`}
                    onClick={() => setSortBy("date")}
                    aria-pressed={sortBy === "date"}
                  >
                    Date
                  </button>
                </div>
              </div>

              <div className="compact-toggle-group">
                <span className="compact-toggle-label">Order</span>

                <div className="compact-toggle-buttons">
                  <button
                    type="button"
                    className={`compact-toggle-button ${sortDirection === "desc" ? "active" : ""}`}
                    onClick={() => setSortDirection("desc")}
                    aria-pressed={sortDirection === "desc"}
                  >
                    Desc
                  </button>

                  <button
                    type="button"
                    className={`compact-toggle-button ${sortDirection === "asc" ? "active" : ""}`}
                    onClick={() => setSortDirection("asc")}
                    aria-pressed={sortDirection === "asc"}
                  >
                    Asc
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {visibleRecords.length === 0 ? (
        <EmptyState message="No records found for this duo." />
      ) : (
        <ul className="card-list">
          {visibleRecords.map((record) => (
            <li
              key={record.duoKey}
              className="card-list-item"
            >
              <RecordCard
                record={record}
                onDelete={deleteRecord}
              />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
