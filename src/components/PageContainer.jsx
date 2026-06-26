export default function PageContainer({ title, children }) {
  return (
    <main className="page-container">
      {title && <h2 className="page-title">{title}</h2>}
      {children}
    </main>
  );
}
