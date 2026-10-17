import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section-shell error-page">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This page wandered off.</h1>
      <p>The link might be old, or the page may have moved.</p>
      <Link className="button-primary" href="/id">
        Back to portfolio ↗
      </Link>
    </main>
  );
}
