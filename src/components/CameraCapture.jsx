import { useRef, useState } from "react";
import { scanResultScreen } from "../utils/scanResultScreen";

export default function CameraCapture({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    runScan(file);
  }

  async function runScan(file) {
    setIsScanning(true);

    try {
      const result = await scanResultScreen(file);
      onScanComplete(result);
    } catch (err) {
      console.error("Failed to scan result screen:", err);
      setError(
        "Couldn't read that screenshot. Try a clearer, straight-on photo, or enter stats manually below."
      );
    } finally {
      setIsScanning(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="camera-capture">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="camera-capture-input"
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="secondary-button camera-capture-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
      >
        {isScanning ? "Scanning..." : "📷 Scan Result Screen"}
      </button>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Captured result screen"
          className="camera-capture-preview"
        />
      )}

      {error && <p className="camera-capture-error">{error}</p>}
    </div>
  );
}