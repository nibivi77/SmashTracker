import { useRef, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import { useTheme } from "../context/ThemeContext";
import { DATA_VERSION } from "../data/schema";
import PageContainer from "../components/PageContainer";
import Panel from "../components/Panel";
import MessageBanner from "../components/MessageBanner";
import {
  normalizeImportedData,
  validateImportedRecords
} from "../utils/importValidation";

export default function Settings() {
  const fileInputRef = useRef(null);
  const { records, importRecords } = useRecords();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");

  function handleExport() {
    try {
      const payload = {
        version: DATA_VERSION,
        records
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      a.href = url;
      a.download = `smashtracker-records-${date}.json`;
      a.click();

      URL.revokeObjectURL(url);
      setMessageTone("success");
      setMessage("Records exported successfully.");
    } catch (error) {
      console.error("Export failed:", error);
      setMessageTone("error");
      setMessage("Export failed.");
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const text = loadEvent.target?.result;

        if (typeof text !== "string") {
          setMessageTone("error");
          setMessage("Could not read file.");
          return;
        }

        const parsed = JSON.parse(text);
        const normalized = normalizeImportedData(parsed);

        if (!normalized) {
          setMessageTone("error");
          setMessage("Invalid file format.");
          return;
        }

        const validationError = validateImportedRecords(normalized.records);

        if (validationError) {
          setMessageTone("error");
          setMessage(validationError);
          return;
        }

        const confirmed = window.confirm(
          "Importing will replace all current records. Continue?"
        );

        if (!confirmed) {
          setMessageTone("info");
          setMessage("Import cancelled.");
          return;
        }

        importRecords(normalized.records);
        setMessageTone("success");
        setMessage(`Imported ${normalized.records.length} record(s) successfully.`);
      } catch (error) {
        console.error("Import failed:", error);
        setMessageTone("error");
        setMessage("Import failed. Make sure the file is valid JSON.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  return (
    <PageContainer title="Settings">
      <Panel title="Appearance">
        <div className="settings-row">
          <div>
            <strong>Theme</strong>
            <p className="section-helper-text">
              Current mode: {theme === "dark" ? "Dark" : "Light"}
            </p>
          </div>

          <button
            type="button"
            className={`theme-toggle ${isDarkMode ? "theme-toggle-dark" : "theme-toggle-light"}`}
            onClick={toggleTheme}
            aria-pressed={isDarkMode}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb" />
            </span>
            <span>{isDarkMode ? "Dark" : "Light"}</span>
          </button>
        </div>
      </Panel>

      <Panel title="Export Records">
        <p>Download your current records as a JSON backup file.</p>
        <button type="button" className="primary-button" onClick={handleExport}>
          Export JSON
        </button>
      </Panel>

      <Panel title="Import Records">
        <p>Import a previously exported JSON file. This replaces all current records.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          style={{ display: "none" }}
        />

        <button type="button" className="secondary-button" onClick={handleImportClick}>
          Import JSON
        </button>
      </Panel>

      <Panel title="Current Data">
        <p>Total records: {records.length}</p>
      </Panel>

      <MessageBanner message={message} tone={messageTone} />
    </PageContainer>
  );
}
