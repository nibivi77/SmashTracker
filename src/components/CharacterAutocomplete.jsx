import { useMemo } from "react";
import { characters } from "../data/characters";

export default function CharacterAutocomplete({
  label,
  placeholder = "Search character...",
  query,
  selectedCharacter,
  onQueryChange,
  onSelectCharacter,
  helperText,
  noResultsText = "No matching characters found."
}) {
  const filteredCharacters = useMemo(() => {
    return characters.filter((character) =>
      character.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="field-group character-autocomplete">
      {label && (
        <label className="field-label">
          {label}
        </label>
      )}

      <input
        className="text-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      {helperText && (
        <p className="field-helper">
          {helperText}
        </p>
      )}

      {selectedCharacter && (
        <div className="selected-character-preview">
          <img
            src={`${import.meta.env.BASE_URL}${selectedCharacter.icon}`}
            alt={selectedCharacter.name}
            className="selected-character-icon"
          />
          <strong>{selectedCharacter.name}</strong>
        </div>
      )}

      {query.length > 0 && !selectedCharacter && (
        <ul className="autocomplete-results">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <li key={character.id}>
                <button
                  type="button"
                  className="autocomplete-option"
                  onClick={() => onSelectCharacter(character)}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${character.icon}`}
                    alt={character.name}
                    className="autocomplete-option-icon"
                  />
                  <span>{character.name}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="autocomplete-empty">{noResultsText}</li>
          )}
        </ul>
      )}
    </div>
  );
}
