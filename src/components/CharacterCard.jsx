import { useId, useState } from "react";
import { characters } from "../data/characters";
import { players } from "../data/players";
import { formatRatio, getPlayerRatio } from "../utils/calculations";
import RankBadge from "./RankBadge";

export default function CharacterCard({ performance, rank = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const character = characters.find((c) => c.id === performance.characterId);
  const partner = characters.find((c) => c.id === performance.partnerCharacterId);
  const player = players.find((p) => p.id === performance.playerId);
  const partnerPlayer = players.find((p) => p.id === performance.partnerPlayerId);

  const ratio = formatRatio(getPlayerRatio(performance.damageGiven, performance.damageTaken));

  const savedAt = performance.timestamp
    ? new Date(performance.timestamp).toLocaleString()
    : "Imported before timestamps";

  return (
    <div className={`character-card accordion-card ${isOpen ? "expanded" : ""}`}>
      <button
        type="button"
        className="accordion-trigger character-card-summary"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="character-card-header">
          {character && (
            <img
              src={`${import.meta.env.BASE_URL}${character.icon}`}
              alt={character.name}
              className="character-card-icon"
            />
          )}

          <div>
            <div className="character-card-player-name">{player?.name || "Player"}</div>
            <div className="character-card-name-row">
              <strong>{character?.name}</strong>
            </div>
          </div>
        </div>

        <div className="accordion-header-right">
          <div className="ratio-badge ratio-badge-player">
            {ratio}
          </div>

          <RankBadge rank={rank} />

          <span className="accordion-arrow" aria-hidden="true">
            ▾
          </span>
        </div>
      </button>

      <div
        id={contentId}
        className="accordion-content"
      >
        <div className="accordion-content-inner">
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
              <strong>{partnerPlayer?.name}: {partner?.name}</strong>
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
      </div>
    </div>
  );
}
