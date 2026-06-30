export default function RecordResultCard({
  title,
  tone = "info",
  newRatio,
  oldRatio = null,
  difference = null,
  differenceLabel = ""
}) {
  function formatRatio(value) {
    return Number(value).toFixed(2);
  }

  return (
    <div className={`record-result-card record-result-card-${tone}`}>
      <h3 className="record-result-title">{title}</h3>

      <div className="record-result-stats">
        <div className="record-result-row">
          <span>New Duo Ratio</span>
          <strong>{formatRatio(newRatio)}</strong>
        </div>

        {oldRatio !== null && (
          <div className="record-result-row">
            <span>Previous Duo Ratio</span>
            <strong>{formatRatio(oldRatio)}</strong>
          </div>
        )}

        {difference !== null && (
          <div className="record-result-row">
            <span>{differenceLabel}</span>
            <strong>{formatRatio(difference)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
