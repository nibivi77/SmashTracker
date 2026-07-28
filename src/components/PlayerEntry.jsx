import { characters } from "../data/characters";
import CharacterAutocomplete from "./CharacterAutocomplete";

export const emptyPlayerEntry = {
  characterId: null,
  query: "",
  damageGiven: "",
  damageTaken: ""
};

export default function PlayerEntry({ playerName = "Player", value, onChange }) {
  const { characterId, query, damageGiven, damageTaken } = value;

  const selectedCharacter = characterId
    ? characters.find((c) => c.id === characterId) || null
    : null;

  function handleSelectCharacter(character) {
    onChange({
      ...value,
      characterId: character.id,
      query: character.name
    });
  }

  function handleQueryChange(nextQuery) {
    onChange({
      ...value,
      characterId: null,
      query: nextQuery
    });
  }

  function updateField(field, fieldValue) {
    const key = field === "given" ? "damageGiven" : "damageTaken";

    onChange({
      ...value,
      [key]: fieldValue
    });
  }

  return (
    <section className="player-entry-panel">
      <CharacterAutocomplete
        label={`${playerName}'s Character`}
        placeholder="Search character..."
        query={query}
        selectedCharacter={selectedCharacter}
        onQueryChange={handleQueryChange}
        onSelectCharacter={handleSelectCharacter}
      />

      <div className="stat-input-grid">
        <label className="field-label">
          Damage Given
          <input
            className="text-input"
            type="number"
            min="1"
            value={damageGiven}
            onChange={(e) => updateField("given", e.target.value)}
          />
        </label>

        <label className="field-label">
          Damage Taken
          <input
            className="text-input"
            type="number"
            min="1"
            value={damageTaken}
            onChange={(e) => updateField("taken", e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}