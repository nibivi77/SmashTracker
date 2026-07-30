import { useRecords } from "../context/RecordsContext";

// Mounted once in App.jsx so it's visible on every page — Firebase errors
// otherwise only ever reach console.error, which nobody sees on a phone.
export default function ConnectionBanner() {
  const { isConnected, syncError } = useRecords();

  if (!isConnected) {
    return (
      <div className="connection-banner">
        Can't reach the shared database right now.
      </div>
    );
  }

  if (syncError) {
    return <div className="connection-banner">{syncError}</div>;
  }

  return null;
}
