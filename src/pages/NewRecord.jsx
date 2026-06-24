import { useState } from "react";
import PlayerEntry from "../components/PlayerEntry";
import { createDuoKey } from "../utils/duoKey";
import { useRecords } from "../context/RecordsContext";
import { getTeamRatio } from "../utils/calculations";

export default function NewRecord() {
  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});
  const { saveRecord, getRecord, clearAllRecords } = useRecords();

  function handleSubmit() {
    const record = {
      duoKey: createDuoKey(player1.characterId, player2.characterId),
      p1Character: player1.characterId,
      p2Character: player2.characterId,
      p1DamageGiven: Number(player1.damageGiven),
      p1DamageTaken: Number(player1.damageTaken),
      p2DamageGiven: Number(player2.damageGiven),
      p2DamageTaken: Number(player2.damageTaken),
      timestamp: Date.now()
    };

    const existing = getRecord(record.duoKey);

    if (!existing) {
      saveRecord(record);
    } else {
      const currentRatio = getTeamRatio(existing);
      const newRatio = getTeamRatio(record);

      if (newRatio >= currentRatio) {
        saveRecord(record);
      }
    }
  }

  return (
    <div>
      <h2>New Record</h2>

      <PlayerEntry label="Player 1" onChange={setPlayer1} />
      <PlayerEntry label="Player 2" onChange={setPlayer2} />

      <button onClick={handleSubmit}>Save Record</button>

      <button onClick={clearAllRecords}>Clear All Records</button>
    </div>
  );
}
