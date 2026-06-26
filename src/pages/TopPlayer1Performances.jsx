import { useMemo } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import {
  getPlayer1Performances,
  sortPerformancesDesc
} from "../utils/characterPerformances";

export default function TopPlayer1Performances() {
  const { records } = useRecords();

  const topPerformances = useMemo(() => {
    return getPlayer1Performances(records)
      .sort(sortPerformancesDesc)
      .slice(0, 10);
  }, [records]);

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (topPerformances.length === 0) {
    return <EmptyState message="No Player 1 performances available yet." />;
  }

  return (
    <Panel title="Player 1 Top 10 Character Performances">
      <ul className="card-list">
        {topPerformances.map((performance, index) => (
          <li
            key={`${performance.duoKey}-${performance.playerSlot}`}
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
