import { useEffect, useState } from "react";
import PlayerEntry, { emptyPlayerEntry } from "../components/PlayerEntry";
import CameraCapture from "../components/CameraCapture";
import ScanConfirmModal from "../components/ScanConfirmModal";
import RecordCard from "../components/RecordCard";
import RecordResultCard from "../components/RecordResultCard";
import PageContainer from "../components/PageContainer";
import Panel from "../components/Panel";
import MessageBanner from "../components/MessageBanner";
import { createDuoKey } from "../utils/duoKey";
import { useRecords } from "../context/RecordsContext";
import { getTeamRatio } from "../utils/calculations";
import { players } from "../data/players";
import { ENABLE_RECORD_DELETION_ACTIONS } from "../config/devFlags";

const PLAYER_DUO_STORAGE_KEY = "smashtracker-player-duo";

function loadSavedPlayerDuo() {
  try {
    const raw = localStorage.getItem(PLAYER_DUO_STORAGE_KEY);

    if (!raw) {
      return { p1PlayerId: "", p2PlayerId: "" };
    }

    const parsed = JSON.parse(raw);

    return {
      p1PlayerId: parsed.p1PlayerId || "",
      p2PlayerId: parsed.p2PlayerId || ""
    };
  } catch (error) {
    console.error("Failed to load saved player duo:", error);
    return { p1PlayerId: "", p2PlayerId: "" };
  }
}

function savePlayerDuo(p1PlayerId, p2PlayerId) {
  try {
    localStorage.setItem(
      PLAYER_DUO_STORAGE_KEY,
      JSON.stringify({ p1PlayerId, p2PlayerId })
    );
  } catch (error) {
    console.error("Failed to save player duo:", error);
  }
}

export default function NewRecord() {
  const savedDuo = loadSavedPlayerDuo();

  const [p1PlayerId, setP1PlayerId] = useState(savedDuo.p1PlayerId);
  const [p2PlayerId, setP2PlayerId] = useState(savedDuo.p2PlayerId);
  const [player1, setPlayer1] = useState(emptyPlayerEntry);
  const [player2, setPlayer2] = useState(emptyPlayerEntry);
  const [lastSavedRecord, setLastSavedRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultCardData, setResultCardData] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const { saveRecord, getRecord, clearAllRecords } = useRecords();

  const p1Player = players.find((p) => p.id === p1PlayerId);
  const p2Player = players.find((p) => p.id === p2PlayerId);

  useEffect(() => {
    if (p1PlayerId && p2PlayerId && p1PlayerId !== p2PlayerId) {
      savePlayerDuo(p1PlayerId, p2PlayerId);
    }
  }, [p1PlayerId, p2PlayerId]);

  function validateRecordInput(p1PlayerId, p2PlayerId, player1, player2) {
    if (!p1PlayerId || !p2PlayerId) {
      return "Select both players.";
    }

    if (p1PlayerId === p2PlayerId) {
      return "Player 1 and Player 2 must be different people.";
    }

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

  function handleScanComplete(result) {
    setScanResult(result);
    setIsScanModalOpen(true);
  }

  function handleScanConfirm({ player1: confirmedPlayer1, player2: confirmedPlayer2 }) {
    setPlayer1(confirmedPlayer1);
    setPlayer2(confirmedPlayer2);
    setIsScanModalOpen(false);
  }

  function handleScanCancel() {
    setIsScanModalOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateRecordInput(p1PlayerId, p2PlayerId, player1, player2);

    if (validationError) {
      setErrorMessage(validationError);
      setResultCardData(null);
      return;
    }

    setErrorMessage("");

    const record = {
      duoKey: createDuoKey(player1.characterId, player2.characterId),
      p1Player: p1PlayerId,
      p2Player: p2PlayerId,
      p1Character: player1.characterId,
      p2Character: player2.characterId,
      p1DamageGiven: Number(player1.damageGiven),
      p1DamageTaken: Number(player1.damageTaken),
      p2DamageGiven: Number(player2.damageGiven),
      p2DamageTaken: Number(player2.damageTaken),
      timestamp: Date.now()
    };

    const existing = getRecord(record.duoKey);
    const newRatio = getTeamRatio(record);

    if (!existing) {
      saveRecord(record);
      setLastSavedRecord(record);
      setResultCardData({
        title: "New Record Saved",
        tone: "success",
        newRatio
      });
      return;
    }

    const currentRatio = getTeamRatio(existing);
    const ratioDifference = newRatio - currentRatio;

    if (newRatio > currentRatio) {
      saveRecord(record);
      setLastSavedRecord(record);
      setResultCardData({
        title: "Record Updated",
        tone: "success",
        newRatio,
        oldRatio: currentRatio,
        difference: ratioDifference,
        differenceLabel: "Improved By"
      });
    } else {
      setResultCardData({
        title: "Record Not Beaten",
        tone: "info",
        newRatio,
        oldRatio: currentRatio,
        difference: Math.abs(ratioDifference),
        differenceLabel: "Short By"
      });
    }
  }

  return (
    <PageContainer title="New Record">
      <form onSubmit={handleSubmit} className="page-form">
        <Panel title="Scan a Result Screen">
          <CameraCapture onScanComplete={handleScanComplete} />
        </Panel>

        <Panel title="Who's Playing?">
          <div className="player-select-grid">
            <label className="field-label">
              Player 1
              <select
                className="text-input"
                value={p1PlayerId}
                onChange={(e) => setP1PlayerId(e.target.value)}
              >
                <option value="">Select player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Player 2
              <select
                className="text-input"
                value={p2PlayerId}
                onChange={(e) => setP2PlayerId(e.target.value)}
              >
                <option value="">Select player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        {p1Player && p2Player && p1PlayerId !== p2PlayerId && (
          <>
            <Panel title={p1Player.name}>
              <PlayerEntry
                playerName={p1Player.name}
                value={player1}
                onChange={setPlayer1}
              />
            </Panel>

            <Panel title={p2Player.name}>
              <PlayerEntry
                playerName={p2Player.name}
                value={player2}
                onChange={setPlayer2}
              />
            </Panel>
          </>
        )}

        <div className="form-actions sticky-action-bar">
          <button type="submit" className="primary-button">
            Save Record
          </button>

          {ENABLE_RECORD_DELETION_ACTIONS && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearAllRecords}
            >
              Clear All Records
            </button>
          )}
        </div>

        {errorMessage && (
          <MessageBanner message={errorMessage} tone="error" />
        )}

        {resultCardData && <RecordResultCard {...resultCardData} />}
      </form>

      {lastSavedRecord && (
        <Panel title="Last Saved Record">
          <RecordCard record={lastSavedRecord} />
        </Panel>
      )}

      <ScanConfirmModal
        isOpen={isScanModalOpen}
        scanResult={scanResult}
        onConfirm={handleScanConfirm}
        onCancel={handleScanCancel}
      />
    </PageContainer>
  );
}