import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import { players } from "../data/players";
import {
  getAllCharacterPerformances,
  getPerformancesByPlayerId,
  getBestPerformancePerCharacter,
  sortPerformancesDesc
} from "../utils/characterPerformances";

export default function CharacterRankings() {
  const { records } = useRecords();

  const [scope, setScope] = useState("all");
  const [mode, setMode] = useState("top10");

  const performances = useMemo(() => {
    if (scope === "all") {
      return getAllCharacterPerformances(records);
    }

    return getPerformancesByPlayerId(records, scope);
  }, [records, scope]);

  const visiblePerformances = useMemo(() => {
    if (mode === "bestPerCharacter") {
      return getBestPerformancePerCharacter(performances);
    }

    return [...performances]
      .sort(sortPerformancesDesc)
      .slice(0, 10);
  }, [performances, mode]);

  function getPanelTitle() {
    const scopePlayer = players.find((p) => p.id === scope);
    const scopeLabel = scope === "all" ? "All" : scopePlayer?.name || scope;

    const modeLabel =
      mode === "top10" ? "Top 10" : "Best Per Character";

    return `${scopeLabel} Character Rankings - ${modeLabel}`;
  }

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (visiblePerformances.length === 0) {
    return <EmptyState message="No character performances available yet." />;
  }

  return (
    <Panel title={getPanelTitle()}>
      <div className="character-rankings-toolbar">
        <div className="sort-toggle-stack">
          <div className="compact-toggle-group">
            <span className="compact-toggle-label">Player</span>

            <div className="compact-toggle-buttons">
              <button
                type="button"
                className={`compact-toggle-button ${scope === "all" ? "active" : ""}`}
                onClick={() => setScope("all")}
                aria-pressed={scope === "all"}
              >
                All
              </button>

              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className={`compact-toggle-button ${scope === player.id ? "active" : ""}`}
                  onClick={() => setScope(player.id)}
                  aria-pressed={scope === player.id}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>

          <div className="compact-toggle-group">
            <span className="compact-toggle-label">Mode</span>

            <div className="compact-toggle-buttons">
              <button
                type="button"
                className={`compact-toggle-button ${mode === "top10" ? "active" : ""}`}
                onClick={() => setMode("top10")}
                aria-pressed={mode === "top10"}
              >
                Top 10
              </button>

              <button
                type="button"
                className={`compact-toggle-button ${mode === "bestPerCharacter" ? "active" : ""}`}
                onClick={() => setMode("bestPerCharacter")}
                aria-pressed={mode === "bestPerCharacter"}
              >
                Best / Char
              </button>
            </div>
          </div>
        </div>
      </div>

      <ul className="card-list">
        {visiblePerformances.map((performance, index) => (
          <li
            key={`${performance.duoKey}-${performance.playerSlot}-${performance.characterId}-${index}`}
            className="card-list-item"
          >
            <CharacterCard
              performance={performance}
              rank={index + 1}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
