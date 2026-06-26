import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterAutocomplete from "../components/CharacterAutocomplete";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import RecordCard from "../components/RecordCard";

export default function AllRecords() {
  const { records, deleteRecord } = useRecords();

  const [p1Query, setP1Query] = useState("");
  const [p2Query, setP2Query] = useState("");
  const [selectedP1, setSelectedP1] = useState(null);
  const [selectedP2, setSelectedP2] = useState(null);

  const visibleRecords = useMemo(() => {
    if (!selectedP1 || !selectedP2) {
      return records;
    }

    return records.filter(
      (record) =>
        record.p1Character === selectedP1.id &&
        record.p2Character === selectedP2.id
    );
  }, [records, selectedP1, selectedP2]);

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

  function clearFilters() {
    setP1Query("");
    setP2Query("");
    setSelectedP1(null);
    setSelectedP2(null);
  }

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  return (
    <>
      <Panel title="Find Duo Record">
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

        <div className="filter-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <p className="section-helper-text">
          {!selectedP1 || !selectedP2
            ? "Showing all records. Select both characters to filter by a specific duo."
            : `Showing records for ${selectedP1.name} + ${selectedP2.name}.`}
        </p>
      </Panel>

      {visibleRecords.length === 0 ? (
        <EmptyState message="No records found for this duo." />
      ) : (
        <Panel title="Saved Records">
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
        </Panel>
      )}
    </>
  );
}
