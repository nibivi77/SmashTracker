import { useId, useState } from "react";
import { characters } from "../data/characters";
import { players } from "../data/players";
import { ENABLE_RECORD_DELETION_ACTIONS } from "../config/devFlags";

export default function RecordCard({ record, onDelete, rank = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const p1Player = players.find((c) => c.id === record.p1Player)?.name || "Player 1";
  const p2Player = players.find((c) => c.id === record.p2Player)?.name || "Player 2";

  const p1Char = characters.find((c) => c.id === record.p1Character);
  const p2Char = characters.find((c) => c.id === record.p2Character);

  const p1Ratio =
    record.p1DamageTaken > 0
      ? (record.p1DamageGiven / record.p1DamageTaken).toFixed(2)
      : "∞";

  const p2Ratio =
    record.p2DamageTaken > 0
      ? (record.p2DamageGiven / record.p2DamageTaken).toFixed(2)
      : "∞";

  const totalDealt =
    Number(record.p1DamageGiven) + Number(record.p2DamageGiven);

  const totalTaken =
    Number(record.p1DamageTaken) + Number(record.p2DamageTaken);

  const duoRatio =
    totalTaken > 0 ? (totalDealt / totalTaken).toFixed(2) : "∞";

  const savedAt = record.timestamp
    ? new Date(record.timestamp).toLocaleString()
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
    <div className={`record-card accordion-card ${isOpen ? "expanded" : ""}`}>
      <button
        type="button"
        className="accordion-trigger record-card-summary"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="record-card-duo">
          <div className="record-card-character">
            {p1Char && (
              <img
                src={`${import.meta.env.BASE_URL}${p1Char.icon}`}
                alt={p1Char.name}
                className="record-card-character-icon"
              />
            )}
            <strong>{p1Char?.name}</strong>
          </div>

          <div className="record-card-plus">+</div>

          <div className="record-card-character">
            {p2Char && (
              <img
                src={`${import.meta.env.BASE_URL}${p2Char.icon}`}
                alt={p2Char.name}
                className="record-card-character-icon"
              />
            )}
            <strong>{p2Char?.name}</strong>
          </div>
        </div>

        <div className="accordion-header-right">
          <div className="ratio-badge ratio-badge-team">
            Duo {duoRatio}
          </div>

          {renderRank()}

          <span className="accordion-arrow" aria-hidden="true">
            ▾
          </span>
        </div>
      </button>

      <div id={contentId} className="accordion-content">
        <div className="accordion-content-inner">
          <div className="record-card-stats">
            <div className="record-player-block record-player1">
              <div className="record-player-header">
                <strong>{p1Player}</strong>
                <span className="ratio-badge ratio-badge-player">{p1Ratio}</span>
              </div>

              <div className="record-stat-line">
                <span>Damage Given</span>
                <strong>{record.p1DamageGiven}</strong>
              </div>

              <div className="record-stat-line">
                <span>Damage Taken</span>
                <strong>{record.p1DamageTaken}</strong>
              </div>
            </div>

            <div className="record-player-block record-player2">
              <div className="record-player-header">
                <strong>{p2Player}</strong>
                <span className="ratio-badge ratio-badge-player">{p2Ratio}</span>
              </div>

              <div className="record-stat-line">
                <span>Damage Given</span>
                <strong>{record.p2DamageGiven}</strong>
              </div>

              <div className="record-stat-line">
                <span>Damage Taken</span>
                <strong>{record.p2DamageTaken}</strong>
              </div>
            </div>
          </div>

          <div className="record-card-meta">
            <strong>Saved:</strong> {savedAt}
          </div>

          {onDelete && ENABLE_RECORD_DELETION_ACTIONS && (
            <div className="record-card-actions">
              <button
                type="button"
                className="danger-button"
                onClick={() => onDelete(record.duoKey)}
              >
                Delete Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
