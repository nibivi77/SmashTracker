import { characters } from "../data/characters";

export default function CharacterCard({ performance, rankLabel }) {
  const character = characters.find((c) => c.id === performance.characterId);
  const partner = characters.find((c) => c.id === performance.partnerCharacterId);

  const ratio =
    performance.damageTaken > 0
      ? (performance.damageGiven / performance.damageTaken).toFixed(2)
      : "∞";

  const savedAt = performance.timestamp
    ? new Date(performance.timestamp).toLocaleString()
    : "Imported before timestamps";

  return (
    <div className="character-card">
      <div className="character-card-top">
        <div className="character-card-header">
          {character && (
            <img
              src={`${import.meta.env.BASE_URL}${character.icon}`}
              alt={character.name}
              className="character-card-icon"
            />
          )}

          <div>
            <div className="character-card-name-row">
              <strong>{character?.name}</strong>
              {rankLabel && <span className="inline-rank-label">{rankLabel}</span>}
            </div>
            <div className="character-card-role">
              {performance.playerSlot === "p1" ? "Player 1" : "Player 2"}
            </div>
          </div>
        </div>

        <div className="ratio-badge ratio-badge-player">
          {ratio}
        </div>
      </div>

      <div className="character-card-stats">
        <div className="character-stat-line">
          <span>Damage Given</span>
          <strong>{performance.damageGiven}</strong>
        </div>

        <div className="character-stat-line">
          <span>Damage Taken</span>
          <strong>{performance.damageTaken}</strong>
        </div>

        <div className="character-stat-line">
          <span>Partner</span>
          <strong>{partner?.name}</strong>
        </div>
      </div>

      <div className="character-card-meta">
        <div>
          <strong>Duo:</strong> {performance.duoKey}
        </div>
        <div>
          <strong>Saved:</strong> {savedAt}
        </div>
      </div>
    </div>
  );
}
