import { useState } from "react";
import PlayerEntry from "../components/PlayerEntry";
import { createDuoKey } from "../utils/duoKey";
import { useRecords } from "../context/RecordsContext";
import {getTeamRatio} from "../utils/calculations";


export default function NewRecord() {
  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});
  const { saveRecord, getRecord, clearAllRecords } = useRecords();

  async function handleSubmit() {
    const record = {
      duoKey: createDuoKey(player1.characterId, player2.characterId),
      p1Character: player1.characterId,
      p2Character: player2.characterId,
      p1DamageGiven: player1.damageGiven,
      p1DamageTaken: player1.damageTaken,

      p2DamageGiven: player2.damageGiven,
      p2DamageTaken: player2.damageTaken,

      timestamp: Date.now()
    };

    console.log(record);

    const existing = await getRecord(record.duoKey);
  console.log(existing);
    if (!existing) {
      await saveRecord(record);
    } else {
      const currentRatio =
        getTeamRatio(existing);

      const newRatio =
        getTeamRatio(record);

      if (newRatio > currentRatio) {
        await saveRecord(record);
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