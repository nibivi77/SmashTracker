import { useId, useState } from "react";
import { characters } from "../data/characters";
import { players } from "../data/players";

export default function CharacterCard({ performance, rank = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const character = characters.find((c) => c.id === performance.characterId);
  const partner = characters.find((c) => c.id === performance.partnerCharacterId);
  const player = players.find((p) => p.id === performance.playerId);
  const partnerPlayer = players.find((p) => p.id === performance.partnerPlayerId);

  const ratio =
    performance.damageTaken > 0
      ? (performance.damageGiven / performance.damageTaken).toFixed(2)
      : "∞";

  const savedAt = performance.timestamp
    ? new Date(performance.timestamp).toLocaleString()
    : "Imported before timestamps";

  function renderRank() {
    if (rank === null) {
      return null;
    }

    if (rank === 1) {
      return (
        <img
          src={`${import.meta.env.BASE_URL}first.png`}
          alt="1st place"
          className="team-rank-image-inline"
        />
      );
    }

    if (rank === 2) {
      return (
        <img
          src={`${import.meta.env.BASE_URL}second.png`}
          alt="2nd place"
          className="team-rank-image-inline"
        />
      );
    }

    if (rank === 3) {
      return (
        <img
          src={`${import.meta.env.BASE_URL}third.png`}
          alt="3rd place"
          className="team-rank-image-inline"
        />
      );
    }

    return (
      <span className="team-rank-badge-inline">
        #{rank}
      </span>
    );
  }

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

          {renderRank()}

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
