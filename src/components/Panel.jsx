export default function Panel({ title, children }) {
  return (
    <section className="panel">
      {title && <h3 className="panel-title">{title}</h3>}
      {children}
    </section>
  );
}
