import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import RecordCard from "../components/RecordCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import { getTeamRatio } from "../utils/calculations";

export default function TopTeams() {
  const { records } = useRecords();
  const [mode, setMode] = useState("top");

  const visibleTeams = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const ratioComparison = getTeamRatio(a) - getTeamRatio(b);

      if (ratioComparison !== 0) {
        return mode === "top" ? -ratioComparison : ratioComparison;
      }

      const aTimestamp = a.timestamp ?? 0;
      const bTimestamp = b.timestamp ?? 0;

      return bTimestamp - aTimestamp;
    });

    return sorted.slice(0, 10);
  }, [records, mode]);

  function getPanelTitle() {
    return mode === "top" ? "Top 10 Team Ratios" : "Worst 10 Team Ratios";
  }

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (visibleTeams.length === 0) {
    return <EmptyState message="No team records available yet." />;
  }

  return (
    <Panel title={getPanelTitle()}>
      <div className="character-rankings-toolbar">
        <div className="compact-toggle-group">
          <span className="compact-toggle-label">Mode</span>

          <div className="compact-toggle-buttons">
            <button
              type="button"
              className={`compact-toggle-button ${mode === "top" ? "active" : ""}`}
              onClick={() => setMode("top")}
              aria-pressed={mode === "top"}
            >
              Top 10
            </button>

            <button
              type="button"
              className={`compact-toggle-button ${mode === "worst" ? "active" : ""}`}
              onClick={() => setMode("worst")}
              aria-pressed={mode === "worst"}
            >
              Worst 10
            </button>
          </div>
        </div>
      </div>

      <ul className="card-list">
        {visibleTeams.map((record, index) => (
          <li key={record.duoKey} className="card-list-item">
            <div className="rank-label">
              <strong>#{index + 1}</strong>
            </div>

            <RecordCard record={record} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
