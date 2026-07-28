import { useEffect, useState } from "react";
import Modal from "./Modal";
import PlayerEntry from "./PlayerEntry";

export default function ScanConfirmModal({ isOpen, scanResult, onConfirm, onCancel }) {
  const [draftPlayer1, setDraftPlayer1] = useState(scanResult?.player1 ?? null);
  const [draftPlayer2, setDraftPlayer2] = useState(scanResult?.player2 ?? null);

  useEffect(() => {
    if (scanResult) {
      setDraftPlayer1(scanResult.player1);
      setDraftPlayer2(scanResult.player2);
    }
  }, [scanResult]);

  if (!isOpen || !scanResult || !draftPlayer1 || !draftPlayer2) {
    return null;
  }

  return (
    <Modal
      title="Confirm Scanned Result"
      isOpen={isOpen}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => onConfirm({ player1: draftPlayer1, player2: draftPlayer2 })}
          >
            Use These Stats
          </button>
        </>
      }
    >
      <p className="section-helper-text">
        Double-check the scanned characters and damage numbers below — edit anything
        that looks off before confirming.
      </p>

      {scanResult.warning && (
        <p className="camera-capture-warning">{scanResult.warning}</p>
      )}

      <div className="scan-confirm-grid">
        <PlayerEntry playerName="Player 1" value={draftPlayer1} onChange={setDraftPlayer1} />
        <PlayerEntry playerName="Player 2" value={draftPlayer2} onChange={setDraftPlayer2} />
      </div>
    </Modal>
  );
}