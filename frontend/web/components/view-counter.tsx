'use client';

import { useEffect } from 'react';

export function ViewCounter({ projectSlug, path }: { projectSlug: string; path: string }) {
  useEffect(() => {
    void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, projectSlug }),
      keepalive: true,
    }).catch(() => undefined);
  }, [path, projectSlug]);
  return null;
}
