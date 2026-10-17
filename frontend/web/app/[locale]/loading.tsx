export default function Loading() {
  return (
    <main className="section-shell loading-page" aria-label="Loading">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-copy" />
      <div className="skeleton-cards">
        <i />
        <i />
        <i />
      </div>
    </main>
  );
}
