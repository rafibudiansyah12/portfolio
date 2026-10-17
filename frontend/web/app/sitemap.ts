import type { MetadataRoute } from 'next';
import { safeGet, queryString, type ApiList, type Post, type Project, SITE_URL } from './lib/api';

const emptyList = <T>(): ApiList<T> => ({
  items: [],
  page: 1,
  limit: 100,
  total: 0,
  totalPages: 0,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    safeGet<ApiList<Project>>(
      `/projects${queryString({ page: 1, limit: 100 })}`,
      emptyList<Project>(),
      3600,
    ),
    safeGet<ApiList<Post>>(
      `/posts${queryString({ page: 1, limit: 100 })}`,
      emptyList<Post>(),
      3600,
    ),
  ]);
  const locales: MetadataRoute.Sitemap = ['id', 'en'].map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    alternates: { languages: { id: `${SITE_URL}/id`, en: `${SITE_URL}/en` } },
    changeFrequency: 'weekly',
    priority: 1,
  }));
  return [
    ...locales,
    ...projects.items.flatMap((project) =>
      ['id', 'en'].map((locale) => ({
        url: `${SITE_URL}/${locale}/projects/${project.slug}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ),
    ...posts.items.flatMap((post) =>
      ['id', 'en'].map((locale) => ({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt ?? Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ),
  ];
}
