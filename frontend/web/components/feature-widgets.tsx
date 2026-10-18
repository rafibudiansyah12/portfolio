'use client';

import { ProjectReactionSchema } from '@portfolio/shared';
import { useEffect, useState } from 'react';
import { apiPost } from '../app/lib/api';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function GitHubActivity() {
  const [summary, setSummary] = useState<{
    username: string;
    publicRepos: number;
    followers: number;
    stars: number;
    contributionsLast30Days: number | null;
    recentPublicEvents: number;
    topLanguages: Array<{ language: string; count: number }>;
    featuredRepos: Array<{ name: string; stars: number; language: string | null; url: string }>;
  } | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/github/summary`)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: typeof summary) => {
        if (active) setSummary(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  if (!summary) return null;
  return (
    <section className="section-shell github-activity">
      <div>
        <p className="eyebrow">GITHUB / LIVE SNAPSHOT</p>
        <h2>@{summary.username}</h2>
        <p>
          {summary.publicRepos} public repos · {summary.followers} followers · {summary.stars} stars
        </p>
        <p>
          {summary.contributionsLast30Days ?? summary.recentPublicEvents}{' '}
          {summary.contributionsLast30Days === null ? 'public events' : 'contributions'} in the last
          30 days
        </p>
      </div>
      <div className="github-languages">
        {summary.topLanguages.map((item) => (
          <span key={item.language}>
            {item.language}
            <small>{item.count}</small>
          </span>
        ))}
      </div>
      <div className="github-repos">
        {summary.featuredRepos.slice(0, 3).map((repo) => (
          <a href={repo.url} key={repo.name} target="_blank" rel="noreferrer">
            {repo.name}
            <span>★ {repo.stars}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ProjectReactions({
  slug,
  initial,
}: {
  slug: string;
  initial?: Array<{ emoji: string; count: number }>;
}) {
  const [reactions, setReactions] = useState(initial ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  async function react(emoji: string) {
    const parsed = ProjectReactionSchema.safeParse({ emoji });
    if (!parsed.success || busy) return;
    setBusy(emoji);
    try {
      const result = await apiPost<{ reactions: Array<{ emoji: string; count: number }> }>(
        `/projects/${encodeURIComponent(slug)}/reactions`,
        parsed.data,
      );
      if (result.reactions) setReactions(result.reactions);
    } catch {
      // The reaction is optional; keep the current counts if the API is unavailable.
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="project-reactions" aria-label="React to this project">
      {['👍', '❤️', '🚀', '👏'].map((emoji) => (
        <button
          key={emoji}
          disabled={busy !== null}
          onClick={() => void react(emoji)}
          aria-label={`React ${emoji}`}
        >
          {emoji}
          <span>{reactions.find((item) => item.emoji === emoji)?.count ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export function GuestbookLive({ since }: { since: string }) {
  const [entries, setEntries] = useState<
    Array<{ id: string; name: string; message: string; createdAt: string }>
  >([]);
  useEffect(() => {
    const source = new EventSource(
      `${apiBase}/guestbook/stream?since=${encodeURIComponent(since)}`,
    );
    source.addEventListener('guestbook', (event) => {
      const batch = JSON.parse((event as MessageEvent<string>).data) as typeof entries;
      setEntries((current) =>
        [...batch, ...current].filter(
          (entry, index, all) => all.findIndex((item) => item.id === entry.id) === index,
        ),
      );
    });
    source.addEventListener('disabled', () => source.close());
    return () => source.close();
  }, [since]);
  if (!entries.length) return null;
  return (
    <div className="guestbook-live" aria-live="polite">
      <span className="status-dot" /> Live updates
      {entries.map((entry) => (
        <article key={entry.id}>
          <strong>{entry.name}</strong>
          <p>{entry.message}</p>
        </article>
      ))}
    </div>
  );
}

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiPost('/subscribe', { email, website: '' });
      setStatus('sent');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }
  return (
    <form className="newsletter-form" onSubmit={(event) => void submit(event)}>
      <label htmlFor="newsletter-email">Occasional notes, no noise.</label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <button className="button-primary">Subscribe ↗</button>
      </div>
      {status === 'sent' && (
        <small role="status">Check your inbox to confirm your subscription.</small>
      )}
      {status === 'error' && (
        <small role="alert">Subscription could not be submitted. Please try again.</small>
      )}
    </form>
  );
}

export function AvailabilityBadge({ locale = 'en' }: { locale?: string }) {
  return (
    <span className="availability-badge">
      <i /> {locale === 'id' ? 'Tersedia untuk peluang' : 'Open for work'}
    </span>
  );
}
