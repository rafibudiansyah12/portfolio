import { ImageResponse } from 'next/og';
import { apiGet, type Post } from '../../../lib/api';

export const alt = 'Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await apiGet<Post>(`/posts/${encodeURIComponent(slug)}`, 300).catch(() => null);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        color: '#eff8f4',
        background: 'linear-gradient(135deg,#111a19,#263b35)',
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 8, color: '#a4f0d1' }}>
        RAFI BUDIANSYAH · JOURNAL
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
          {post?.title ?? 'Notes & ideas'}
        </div>
        <div style={{ fontSize: 30, color: '#b4c7bf' }}>
          {post?.excerpt ?? 'Engineering, interface design, and lessons learned.'}
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#a4f0d1' }}>
        {post?.tags.slice(0, 3).join(' · ') ?? 'ARTICLE'}
      </div>
    </div>,
    size,
  );
}
