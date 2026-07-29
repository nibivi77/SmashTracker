import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterAutocomplete from "../components/CharacterAutocomplete";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import RecordCard from "../components/RecordCard";
import { players } from "../data/players";
import { getTeamRatio } from "../utils/calculations";

export default function AllRecords() {
  const { records, deleteRecord } = useRecords();

  const [char1Query, setChar1Query] = useState("");
  const [char2Query, setChar2Query] = useState("");
  const [selectedChar1, setSelectedChar1] = useState(null);
  const [selectedChar2, setSelectedChar2] = useState(null);

  const [activePlayers, setActivePlayers] = useState(
    () => new Set(players.map((p) => p.id))
  );

  const [sortBy, setSortBy] = useState("ratio");
  const [sortDirection, setSortDirection] = useState("desc");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const hasActiveCharacterFilter = Boolean(selectedChar1 || selectedChar2);
  const hasActivePlayerFilter = activePlayers.size < players.length;
  const hasCustomSort = sortBy !== "ratio" || sortDirection !== "desc";
  const hasActiveControls = hasActiveCharacterFilter || hasActivePlayerFilter || hasCustomSort;

  const visibleRecords = useMemo(() => {
    let filtered = records;

    if (selectedChar1 && selectedChar2) {
      filtered = filtered.filter(
        (record) =>
          record.p1Character === selectedChar1.id &&
          record.p2Character === selectedChar2.id
      );
    } else if (selectedChar1) {
      filtered = filtered.filter(
        (record) =>
          record.p1Character === selectedChar1.id ||
          record.p2Character === selectedChar1.id
      );
    } else if (selectedChar2) {
      filtered = filtered.filter(
        (record) =>
          record.p1Character === selectedChar2.id ||
          record.p2Character === selectedChar2.id
      );
    }

    if (activePlayers.size < players.length) {
      filtered = filtered.filter(
        (record) =>
          activePlayers.has(record.p1Player) &&
          activePlayers.has(record.p2Player)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [records, selectedChar1, selectedChar2, activePlayers, sortBy, sortDirection]);

  function handleChar1QueryChange(value) {
    setChar1Query(value);
    setSelectedChar1(null);
  }

  function handleChar2QueryChange(value) {
    setChar2Query(value);
    setSelectedChar2(null);
  }

  function handleSelectChar1(character) {
    setSelectedChar1(character);
    setChar1Query(character.name);
  }

  function handleSelectChar2(character) {
    setSelectedChar2(character);
    setChar2Query(character.name);
  }

  function togglePlayer(playerId) {
    setActivePlayers((prev) => {
      const next = new Set(prev);

      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }

      return next;
    });
  }

  function clearControls() {
    setChar1Query("");
    setChar2Query("");
    setSelectedChar1(null);
    setSelectedChar2(null);
    setActivePlayers(new Set(players.map((p) => p.id)));
    setSortBy("ratio");
    setSortDirection("desc");
    setIsSearchOpen(false);
    setIsSortOpen(false);
  }

  function getFilterStatusText() {
    const parts = [];

    if (selectedChar1 && selectedChar2) {
      parts.push(`Duo: ${selectedChar1.name} + ${selectedChar2.name}`);
    } else if (selectedChar1) {
      parts.push(`Character: ${selectedChar1.name}`);
    } else if (selectedChar2) {
      parts.push(`Character: ${selectedChar2.name}`);
    }

    if (activePlayers.size < players.length && activePlayers.size > 0) {
      const activeNames = players
        .filter((p) => activePlayers.has(p.id))
        .map((p) => p.name)
        .join(", ");
      parts.push(`Players: ${activeNames}`);
    }

    return parts;
  }

  function getSortStatusText() {
    const sortLabel = sortBy === "ratio" ? "Ratio" : "Date";
    const directionLabel = sortDirection === "desc" ? "Newest" : "Oldest";
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
              Search
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

        {(hasActiveCharacterFilter || hasActivePlayerFilter || hasCustomSort) && (
          <div className="records-status-chips">
            {getFilterStatusText().map((text, index) => (
              <span key={index} className="status-chip">
                {text}
              </span>
            ))}

            <span className="status-chip">
              Sort: {getSortStatusText()}
            </span>
          </div>
        )}

        {isSearchOpen && (
          <div className="toolbar-drawer">
            <div className="toolbar-drawer-grid">
              <CharacterAutocomplete
                label="Character 1 (optional)"
                placeholder="Any character..."
                query={char1Query}
                selectedCharacter={selectedChar1}
                onQueryChange={handleChar1QueryChange}
                onSelectCharacter={handleSelectChar1}
              />

              <CharacterAutocomplete
                label="Character 2 (optional)"
                placeholder="Any character..."
                query={char2Query}
                selectedCharacter={selectedChar2}
                onQueryChange={handleChar2QueryChange}
                onSelectCharacter={handleSelectChar2}
              />
            </div>

            <div className="player-filter-section">
              <span className="compact-toggle-label">Filter by Player</span>

              <div className="compact-toggle-buttons">
                {players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    className={`compact-toggle-button ${activePlayers.has(player.id) ? "active" : ""}`}
                    onClick={() => togglePlayer(player.id)}
                    aria-pressed={activePlayers.has(player.id)}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>

            <p className="section-helper-text">
              {!selectedChar1 && !selectedChar2
                ? "Select one or both characters to filter. Leave empty to show all."
                : selectedChar1 && selectedChar2
                  ? `Showing exact duo: ${selectedChar1.name} + ${selectedChar2.name}`
                  : `Showing all duos containing: ${selectedChar1?.name || selectedChar2?.name}`}
            </p>
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
        <EmptyState message="No records match your filters." />
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
