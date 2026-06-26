import { useMemo } from "react";
import { useRecords } from "../context/RecordsContext";
import CharacterCard from "../components/CharacterCard";
import EmptyState from "../components/EmptyState";
import Panel from "../components/Panel";
import {
  getPlayer2Performances,
  getBestPerformancePerCharacter
} from "../utils/characterPerformances";

export default function Player2BestPerCharacter() {
  const { records } = useRecords();

  const bestPerformances = useMemo(() => {
    const p2Performances = getPlayer2Performances(records);
    return getBestPerformancePerCharacter(p2Performances);
  }, [records]);

  if (records.length === 0) {
    return <EmptyState message="No records saved yet." />;
  }

  if (bestPerformances.length === 0) {
    return <EmptyState message="No Player 2 character performances available yet." />;
  }

  return (
    <Panel title="Player 2 Best Record Per Character">
      <ul className="card-list">
        {bestPerformances.map((performance, index) => (
          <li
            key={`${performance.characterId}-${performance.playerSlot}`}
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
