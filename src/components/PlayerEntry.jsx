import { useState } from "react";
import { characters } from "../data/characters";

export default function PlayerEntry({ label, onChange }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [damageTaken, setDamageTaken] = useState("");
  const [damageGiven, setDamageGiven] = useState("");

const filtered = characters.filter((c) =>
  c.name.toLowerCase().includes(query.toLowerCase())
);

function handleSelect(character) {
  setSelected(character);
  setQuery(character.name);

  onChange({
    characterId: character.id,
    damageTaken,
    damageGiven
  });
}

function updateField(field, value) {
  if (field === "taken") setDamageTaken(value);
  if (field === "given") setDamageGiven(value);

  onChange({
    characterId: selected?.id || null,
    damageTaken: field === "taken" ? value : damageTaken,
    damageGiven: field === "given" ? value : damageGiven
  });
}

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>{label}</h3>

      {/* Character Search */}
      <input
        type="text"
        placeholder="Search character..."
        value={query}
        onChange={(e) => {
        setQuery(e.target.value);
        setSelected(null); 
}}
      />
        {selected && (
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src={selected.icon}
            alt={selected.name}
            style={{ width: "48px", height: "48px" }}
          />
          <strong>{selected.name}</strong>
        </div>
  )}

      {/* Autocomplete dropdown */}
      {query.length > 0  && !selected && (
        <ul style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
          {filtered.map((char) => (
            <li
              key={char.name}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.25rem 0"
              }}
              onClick={() => handleSelect(char)}
            >
              <img
                src={char.icon}
                alt={char.name}
                style={{ width: "32px", height: "32px", borderRadius: "4px" }}
              />
              {char.name}
            </li>
          ))}
        </ul>
      )}

      {/* Damage fields */}
      <div style={{ marginTop: "1rem" }}>
        <input
          type="number"
          placeholder="Damage Given"
          value={damageGiven}
          onChange={(e) => updateField("given", e.target.value)}
        />
        <input
          type="number"
          placeholder="Damage Taken"
          value={damageTaken}
          onChange={(e) => updateField("taken", e.target.value)}
        />
      </div>
    </div>
  );
}