'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="section-shell error-page">
      <p className="eyebrow">SOMETHING WENT OFF SCRIPT</p>
      <h1>A small detour.</h1>
      <p>The page could not load right now. Your place is still here.</p>
      <button className="button-primary" onClick={() => reset()}>
        Try again ↗
      </button>
    </main>
  );
}
