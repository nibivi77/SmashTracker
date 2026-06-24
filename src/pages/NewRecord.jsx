import { useState } from "react";
import PlayerEntry from "../components/PlayerEntry";
import RecordCard from "../components/RecordCard";
import { createDuoKey } from "../utils/duoKey";
import { useRecords } from "../context/RecordsContext";
import { getTeamRatio } from "../utils/calculations";

export default function NewRecord() {
  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});
  const [lastSavedRecord, setLastSavedRecord] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const { saveRecord, getRecord, clearAllRecords } = useRecords();

  function validateRecordInput(player1, player2) {
    if (!player1.characterId || !player2.characterId) {
      return "Select a character for both players.";
    }

    const values = [
      { label: "Player 1 damage given", value: player1.damageGiven },
      { label: "Player 1 damage taken", value: player1.damageTaken },
      { label: "Player 2 damage given", value: player2.damageGiven },
      { label: "Player 2 damage taken", value: player2.damageTaken }
    ];

    for (const item of values) {
      if (item.value === "" || item.value === undefined || item.value === null) {
        return `${item.label} is required.`;
      }

      const num = Number(item.value);

      if (Number.isNaN(num)) {
        return `${item.label} must be a valid number.`;
      }

      if (num < 1) {
        return `${item.label} must be at least 1.`;
      }
    }

    return null;
  }

  function handleSubmit(event) {
  event.preventDefault();
  const validationError = validateRecordInput(player1, player2);
  if (validationError) {
    setSaveMessage(validationError);
    return;
  }
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
    setLastSavedRecord(record);
    setSaveMessage("New record saved.");
    return;
  }
  const currentRatio = getTeamRatio(existing);
  const newRatio = getTeamRatio(record);
  if (newRatio >= currentRatio) {
    saveRecord(record);
    setLastSavedRecord(record);
    setSaveMessage("Record updated.");
  } else {
    setSaveMessage("Record not saved. Existing duo record is still better.");
  }
}

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Record</h2>

      <PlayerEntry label="Player 1" onChange={setPlayer1} />
      <PlayerEntry label="Player 2" onChange={setPlayer2} />

      <button type="submit">Save Record</button>

      <button type="button" onClick={clearAllRecords}>
        Clear All Records
      </button>

      {saveMessage && (
        <p style={{ marginTop: "1rem" }}>
          <strong>{saveMessage}</strong>
        </p>
      )}

      {lastSavedRecord && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Last Saved Record</h3>
          <RecordCard record={lastSavedRecord} />
        </div>
      )}
    </form>
  );
}
