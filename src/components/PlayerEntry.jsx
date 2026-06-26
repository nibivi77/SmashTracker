import { useState } from "react";
import CharacterAutocomplete from "./CharacterAutocomplete";

export default function PlayerEntry({ onChange }) {
  const [query, setQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [damageTaken, setDamageTaken] = useState("");
  const [damageGiven, setDamageGiven] = useState("");

  function handleSelectCharacter(character) {
    setSelectedCharacter(character);
    setQuery(character.name);

    onChange({
      characterId: character.id,
      damageTaken,
      damageGiven
    });
  }

  function handleQueryChange(value) {
    setQuery(value);
    setSelectedCharacter(null);

    onChange({
      characterId: null,
      damageTaken,
      damageGiven
    });
  }

  function updateField(field, value) {
    const nextDamageTaken = field === "taken" ? value : damageTaken;
    const nextDamageGiven = field === "given" ? value : damageGiven;

    setDamageTaken(nextDamageTaken);
    setDamageGiven(nextDamageGiven);

    onChange({
      characterId: selectedCharacter?.id || null,
      damageTaken: nextDamageTaken,
      damageGiven: nextDamageGiven
    });
  }

  return (
    <section className="player-entry-panel">
      <CharacterAutocomplete
        label="Character"
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
