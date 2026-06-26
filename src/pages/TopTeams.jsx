import { useMemo } from "react";
import { useRecords } from "../context/RecordsContext";
import RecordCard from "../components/RecordCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import { getTeamRatio } from "../utils/calculations";

export default function TopTeams() {
  const { records } = useRecords();

  const topTeams = useMemo(() => {
    return [...records]
      .sort((a, b) => getTeamRatio(b) - getTeamRatio(a))
      .slice(0, 10);
  }, [records]);

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (topTeams.length === 0) {
    return <EmptyState message="No top teams available yet." />;
  }

  return (
    <Panel title="Top 10 Team Ratios">
      <ul className="card-list">
        {topTeams.map((record, index) => (
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
