import { useRecords } from "../context/RecordsContext";
import RecordCard from "../components/RecordCard";

export default function Records() {
  const { records, deleteRecord } = useRecords();

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
        {records.map((record) => (
          <li
            key={record.duoKey}
            style={{ marginBottom: "1rem" }}
          >
            <RecordCard
              record={record}
              onDelete={deleteRecord}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
