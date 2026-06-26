export default function MessageBanner({ message, tone = "info" }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`message-banner message-banner-${tone}`}>
      <strong>{message}</strong>
    </div>
  );
}
