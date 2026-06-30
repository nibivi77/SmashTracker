import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import {
  getAllCharacterPerformances,
  getPlayer1Performances,
  getPlayer2Performances,
  getBestPerformancePerCharacter,
  sortPerformancesDesc
} from "../utils/characterPerformances";

export default function CharacterRankings() {
  const { records } = useRecords();

  const [scope, setScope] = useState("all");
  const [mode, setMode] = useState("top10");

  const performances = useMemo(() => {
    if (scope === "p1") {
      return getPlayer1Performances(records);
    }

    if (scope === "p2") {
      return getPlayer2Performances(records);
    }

    return getAllCharacterPerformances(records);
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
    const scopeLabel =
      scope === "all" ? "All" : scope === "p1" ? "Player 1" : "Player 2";

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
            <span className="compact-toggle-label">Scope</span>

            <div className="compact-toggle-buttons">
              <button
                type="button"
                className={`compact-toggle-button ${scope === "all" ? "active" : ""}`}
                onClick={() => setScope("all")}
                aria-pressed={scope === "all"}
              >
                All
              </button>

              <button
                type="button"
                className={`compact-toggle-button ${scope === "p1" ? "active" : ""}`}
                onClick={() => setScope("p1")}
                aria-pressed={scope === "p1"}
              >
                P1
              </button>

              <button
                type="button"
                className={`compact-toggle-button ${scope === "p2" ? "active" : ""}`}
                onClick={() => setScope("p2")}
                aria-pressed={scope === "p2"}
              >
                P2
              </button>
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
              rankLabel={`#${index + 1}`}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
