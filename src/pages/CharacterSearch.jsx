import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterAutocomplete from "../components/CharacterAutocomplete";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import { getPerformancesForCharacter } from "../utils/characterPerformances";

export default function CharacterSearch() {
  const { records } = useRecords();
  const [query, setQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const performances = useMemo(() => {
    if (!selectedCharacter) {
      return [];
    }

    return getPerformancesForCharacter(records, selectedCharacter.id);
  }, [records, selectedCharacter]);

  function handleQueryChange(value) {
    setQuery(value);
    setSelectedCharacter(null);
  }

  function handleSelectCharacter(character) {
    setSelectedCharacter(character);
    setQuery(character.name);
  }

  return (
    <>
      <Panel title="Find a Character">
        <CharacterAutocomplete
          label="Search Character"
          placeholder="Type a character name..."
          query={query}
          selectedCharacter={selectedCharacter}
          onQueryChange={handleQueryChange}
          onSelectCharacter={handleSelectCharacter}
        />

        {selectedCharacter && (
          <p className="section-helper-text">
            Found {performances.length} saved game{performances.length === 1 ? "" : "s"} for this character.
          </p>
        )}
      </Panel>

      {selectedCharacter && performances.length === 0 && (
        <EmptyState message="No saved records found for this character." />
      )}

      {selectedCharacter && performances.length > 0 && (
        <Panel title="Character Results">
          <ul className="card-list">
            {performances.map((performance, index) => (
              <li
                key={`${performance.duoKey}-${performance.playerSlot}-${index}`}
                className="card-list-item"
              >
                <CharacterCard performance={performance} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
