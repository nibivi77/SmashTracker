import { useId, useState } from "react";
import { characters } from "../data/characters";

export default function RecordCard({ record, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

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
          <div className="record-card-stats">
            <div className="record-player-block record-player1">
              <div className="record-player-header">
                <strong>Player 1</strong>
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
                <strong>Player 2</strong>
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

          {onDelete && (
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
