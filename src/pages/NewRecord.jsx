import { useState } from "react";
import PlayerEntry from "../components/PlayerEntry";
import RecordCard from "../components/RecordCard";
import PageContainer from "../components/PageContainer";
import Panel from "../components/Panel";
import MessageBanner from "../components/MessageBanner";
import { createDuoKey } from "../utils/duoKey";
import { useRecords } from "../context/RecordsContext";
import { getTeamRatio } from "../utils/calculations";
import { ENABLE_RECORD_DELETION_ACTIONS
 } from "../config/devFlags";


export default function NewRecord() {
  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});
  const [lastSavedRecord, setLastSavedRecord] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");

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
      setMessageTone("error");
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
      setMessageTone("success");
      setSaveMessage("New record saved.");
      return;
    }

    const currentRatio = getTeamRatio(existing);
    const newRatio = getTeamRatio(record);

    if (newRatio > currentRatio) {
      saveRecord(record);
      setLastSavedRecord(record);
      setMessageTone("success");
      setSaveMessage("Record updated.");
    } else {
      setMessageTone("info");
      setSaveMessage("Record not saved. Existing duo record is still better.");
    }
  }

  return (
    <PageContainer title="New Record">
      <form onSubmit={handleSubmit} className="page-form">
        <Panel title="Player 1">
          <PlayerEntry onChange={setPlayer1} />
        </Panel>

        <Panel title="Player 2">
          <PlayerEntry onChange={setPlayer2} />
        </Panel>

        <div className="form-actions form-action-bar">
          <button type="submit" className="primary-button">
            Save Record
          </button>

          {ENABLE_RECORD_DELETION_ACTIONS
 && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearAllRecords}
            >
              Clear All Records
            </button>
          )}
        </div>

        <MessageBanner message={saveMessage} tone={messageTone} />
      </form>

      {lastSavedRecord && (
        <Panel title="Last Saved Record">
          <RecordCard record={lastSavedRecord} />
        </Panel>
      )}
    </PageContainer>
  );
}
