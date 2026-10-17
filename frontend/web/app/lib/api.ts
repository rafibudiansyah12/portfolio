const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

export type ApiList<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  icon: string | null;
};
export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  thumbnailUrl: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  order: number;
  status: 'PUBLISHED';
  publishAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  skills: Array<{ skill: Skill }>;
  images?: Array<{ id: string; caption: string | null; order: number; media: { url: string } }>;
  reactions?: Array<{ emoji: string; count: number }>;
};
export type Experience = {
  id: string;
  type: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
};
export type Profile = {
  headline: string;
  bio: string;
  photoUrl: string | null;
  cvUrl: string | null;
  location: string | null;
  availability: boolean;
  socialLinks: Record<string, string>;
};
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverUrl: string | null;
  publishedAt: string | null;
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
};
export type GuestbookEntry = { id: string; name: string; message: string; createdAt: string };
export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  message: string;
  createdAt: string;
};
export type SiteSettings = { key: string; value: unknown }[];

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Portfolio API returned ${response.status} for ${path}`);
  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data: unknown = await response.json();
      if (typeof data === 'object' && data !== null && 'message' in data)
        message = String(data.message);
    } catch {
      /* response might not contain JSON */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== '') params.set(key, String(value));
  return params.size ? `?${params}` : '';
}

export async function safeGet<T>(path: string, fallback: T, revalidate = 60): Promise<T> {
  try {
    return await apiGet<T>(path, revalidate);
  } catch {
    return fallback;
  }
}
