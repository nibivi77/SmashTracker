import { useRecords } from "../context/RecordsContext";
import { characters } from "../data/characters";

export default function Records() {
  const { records, deleteRecord, dbReady } = useRecords();

  if (!dbReady) {
    return <p>Loading records…</p>;
  }

  if (records.length === 0) {
    return (
      <div>
        <h2>Records</h2>
        <p>No records saved yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Records</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {records.map((record) => {
          const p1Char = characters.find(
            (c) => c.id === record.p1Character
          );

          const p2Char = characters.find(
            (c) => c.id === record.p2Character
          );

          // Individual ratios
          const p1Ratio =
            record.p1DamageTaken > 0
              ? (
                  record.p1DamageGiven /
                  record.p1DamageTaken
                ).toFixed(2)
              : "∞";

          const p2Ratio =
            record.p2DamageTaken > 0
              ? (
                  record.p2DamageGiven /
                  record.p2DamageTaken
                ).toFixed(2)
              : "∞";

          // Duo totals
          const totalDealt =
            Number(record.p1DamageGiven) +
            Number(record.p2DamageGiven);

          const totalTaken =
            Number(record.p1DamageTaken) +
            Number(record.p2DamageTaken);

          const duoRatio =
            totalTaken > 0
              ? (totalDealt / totalTaken).toFixed(2)
              : "∞";

          return (
            <li
              key={record.duoKey}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px"
              }}
            >
              {/* Player 1 */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {p1Char && (
                  <img
                    src={p1Char.icon}
                    alt={p1Char.name}
                    style={{ width: "32px", height: "32px" }}
                  />
                )}
                <strong>Player 1:</strong> {p1Char?.name}
              </div>

              <div>Damage Dealt: {record.p1DamageGiven}</div>
              <div>Damage Taken: {record.p1DamageTaken}</div>
              <div>
                Ratio: <strong>{p1Ratio}</strong>
              </div>

              {/* Player 2 */}
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center"
                }}
              >
                {p2Char && (
                  <img
                    src={p2Char.icon}
                    alt={p2Char.name}
                    style={{ width: "32px", height: "32px" }}
                  />
                )}
                <strong>Player 2:</strong> {p2Char?.name}
              </div>

              <div>Damage Dealt: {record.p2DamageGiven}</div>
              <div>Damage Taken: {record.p2DamageTaken}</div>
              <div>
                Ratio: <strong>{p2Ratio}</strong>
              </div>

              {/* Duo ratio */}
              <div style={{ marginTop: "0.75rem" }}>
                <strong>Duo Ratio:</strong> {duoRatio}
              </div>

              <button
                onClick={() => deleteRecord(record.duoKey)}
                style={{
                  marginTop: "0.75rem",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Delete Record
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}