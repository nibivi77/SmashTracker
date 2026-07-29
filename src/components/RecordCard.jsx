import { useId, useState } from "react";
import { characters } from "../data/characters";
import { players } from "../data/players";
import { ENABLE_RECORD_DELETION_ACTIONS } from "../config/devFlags";
import { formatRatio, getPlayerRatio, getTeamRatio } from "../utils/calculations";
import RankBadge from "./RankBadge";

export default function RecordCard({ record, onDelete, rank = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const p1Char = characters.find((c) => c.id === record.p1Character);
  const p2Char = characters.find((c) => c.id === record.p2Character);
  const p1Player = players.find((p) => p.id === record.p1Player);
  const p2Player = players.find((p) => p.id === record.p2Player);

  const p1Ratio = formatRatio(getPlayerRatio(record.p1DamageGiven, record.p1DamageTaken));
  const p2Ratio = formatRatio(getPlayerRatio(record.p2DamageGiven, record.p2DamageTaken));
  const duoRatio = formatRatio(getTeamRatio(record));

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
            <div>
              <div className="record-card-player-name">{p1Player?.name || "P1"}</div>
              <strong>{p1Char?.name}</strong>
            </div>
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
            <div>
              <div className="record-card-player-name">{p2Player?.name || "P2"}</div>
              <strong>{p2Char?.name}</strong>
            </div>
          </div>
        </div>

        <div className="accordion-header-right">
          <div className="ratio-badge ratio-badge-team">
            Duo {duoRatio}
          </div>

          <RankBadge rank={rank} />

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
                <strong>{p1Player?.name || "Player 1"}</strong>
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
                <strong>{p2Player?.name || "Player 2"}</strong>
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
