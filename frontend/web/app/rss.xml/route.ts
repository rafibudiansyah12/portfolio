import { safeGet, queryString, type ApiList, type Post, SITE_URL } from '../lib/api';

const emptyList: ApiList<Post> = { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export async function GET() {
  const posts = await safeGet<ApiList<Post>>(
    `/posts${queryString({ page: 1, limit: 20 })}`,
    emptyList,
    600,
  );
  const items = posts.items
    .map(
      (post) =>
        `<item><title>${escapeXml(post.title)}</title><link>${SITE_URL}/en/blog/${encodeURIComponent(post.slug)}</link><guid>${SITE_URL}/en/blog/${encodeURIComponent(post.slug)}</guid><description>${escapeXml(post.excerpt)}</description><pubDate>${new Date(post.publishedAt ?? Date.now()).toUTCString()}</pubDate></item>`,
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Rafi Budiansyah — Notes</title><link>${SITE_URL}/en</link><description>Ideas on software, design, and building useful things.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
