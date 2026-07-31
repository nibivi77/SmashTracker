import { createPortal } from "react-dom";

// Shared "are you sure?" dialog — used anywhere a destructive or hard-to-undo
// action needs a confirmation step, instead of the browser's window.confirm().
// Rendered via a portal straight into document.body: several call sites
// (e.g. RecordCard) live inside an `overflow: hidden` ancestor for their
// accordion animation, which would otherwise clip a position:fixed overlay
// to that ancestor's bounds instead of covering the full viewport.
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel
}) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h3 id="confirm-modal-title" className="modal-title">
          {title}
        </h3>

        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button
            type="button"
            className={tone === "danger" ? "danger-button" : "primary-button"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
