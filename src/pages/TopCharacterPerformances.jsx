import { useMemo } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import {
  getAllCharacterPerformances,
  sortPerformancesDesc
} from "../utils/characterPerformances";

export default function TopCharacterPerformances() {
  const { records } = useRecords();

  const topPerformances = useMemo(() => {
    return getAllCharacterPerformances(records)
      .sort(sortPerformancesDesc)
      .slice(0, 10);
  }, [records]);

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (topPerformances.length === 0) {
    return <EmptyState message="No top character performances available yet." />;
  }

  return (
    <Panel title="Top 10 Character Performances">
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
