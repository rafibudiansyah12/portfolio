import { ArrowUpRight, Eye } from 'lucide-react';
import { Link } from '../../../i18n/navigation';
import { Reveal } from '../../../components/motion';
import { ScrollText } from '../../../components/scroll-text';
import { queryString, safeGet, type ApiList, type Post } from '../../lib/api';
import { localeDate } from '../../lib/portfolio-helpers';

const emptyList: ApiList<Post> = { items: [], page: 1, limit: 100, total: 0, totalPages: 0 };

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await safeGet<ApiList<Post>>(
    `/posts${queryString({ page: 1, limit: 100 })}`,
    emptyList,
    60,
  );

  return (
    <main>
      <section className="section-shell section-block journal-section" id="journal">
        <div className="section-heading">
          <Reveal>
            <h2>
              <ScrollText>{locale === 'id' ? 'Jurnal' : 'Journal'}</ScrollText>
            </h2>
          </Reveal>
        </div>
        <div className="post-list" id="journal-details">
          {posts.items.length > 0 ? (
            posts.items.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  locale={locale as 'id' | 'en'}
                  className="blog-card"
                >
                  <span className="blog-cover">
                    {post.coverUrl ? (
                      <img src={post.coverUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-cover-fallback" aria-hidden="true">
                        {post.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    {post.tags[0] && <em className="blog-category">{post.tags[0]}</em>}
                  </span>
                  <span className="blog-body">
                    <span className="blog-meta">
                      <span className="blog-author">
                        <i aria-hidden="true">R</i> Rafi Budiansyah
                      </span>
                      <time dateTime={post.publishedAt ?? undefined}>
                        {localeDate(post.publishedAt, locale)}
                      </time>
                    </span>
                    <strong>{post.title}</strong>
                    <small>{post.excerpt}</small>
                    <span className="blog-read">
                      <Eye size={15} aria-hidden="true" />{' '}
                      {locale === 'id' ? 'Baca artikel' : 'Read article'}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))
          ) : (
            <p className="section-empty">
              {locale === 'id'
                ? 'Tulisan blog akan tampil di sini setelah diterbitkan.'
                : 'Blog posts will appear here after they are published.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
