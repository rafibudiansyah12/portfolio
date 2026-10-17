import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from '../../../../i18n/navigation';
import { notFound } from 'next/navigation';
import { apiGet, safeGet, type Post, type SiteSettings } from '../../../lib/api';
import { Reveal } from '../../../../components/motion';

async function getPost(slug: string): Promise<Post | null> {
  try {
    return await apiGet<Post>(`/posts/${encodeURIComponent(slug)}`, 120);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article not found' };
  const settings = await safeGet<SiteSettings>('/settings/public', [], 300);
  const features = settings.find((setting) => setting.key === 'features')?.value;
  const dynamicOg =
    typeof features !== 'object' ||
    features === null ||
    !('dynamicOg' in features) ||
    features.dynamicOg !== false;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: dynamicOg
        ? [`/${locale}/blog/${post.slug}/opengraph-image`]
        : post.coverUrl
          ? [post.coverUrl]
          : [],
    },
  };
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <main className="article-page section-shell">
      <Link className="back-link" href="/#journal" locale={locale as 'id' | 'en'}>
        <ArrowLeft size={15} /> Back to journal
      </Link>
      <header className="article-header">
        <p className="eyebrow">JOURNAL / {post.tags.slice(0, 2).join(' · ') || 'NOTES'}</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <time>
          {post.publishedAt
            ? new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
                dateStyle: 'long',
              }).format(new Date(post.publishedAt))
            : ''}
        </time>
      </header>
      {post.coverUrl && (
        <div className="case-cover">
          <img src={post.coverUrl} alt={`${post.title} cover`} fetchPriority="high" />
        </div>
      )}
      <Reveal className="article-content rich-content">
        <div dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />
      </Reveal>
      <div className="case-next">
        <span>KEEP EXPLORING</span>
        <Link href="/#projects" locale={locale as 'id' | 'en'}>
          Selected work <ArrowUpRight size={16} />
        </Link>
      </div>
    </main>
  );
}
