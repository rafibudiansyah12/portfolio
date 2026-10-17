'use client';

export function PrintButton() {
  return (
    <button className="button-primary" onClick={() => window.print()}>
      Save as PDF / Cetak
    </button>
  );
}
