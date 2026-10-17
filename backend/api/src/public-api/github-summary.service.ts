import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type GithubUser = { login: string; public_repos: number; followers: number; avatar_url: string };
type GithubRepo = {
  name: string;
  stargazers_count: number;
  language: string | null;
  html_url: string;
};
type GithubEvent = { created_at: string; type: string };
type GithubGraphqlResponse = {
  data?: {
    user?: { contributionsCollection?: { contributionCalendar?: { totalContributions: number } } };
  };
};
type GithubSummary = {
  username: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  stars: number;
  contributionsLast30Days: number | null;
  recentPublicEvents: number;
  topLanguages: Array<{ language: string; count: number }>;
  featuredRepos: Array<{ name: string; stars: number; language: string | null; url: string }>;
  cachedAt: string;
};

@Injectable()
export class GithubSummaryService {
  private cached: { expiresAt: number; value: GithubSummary } | undefined;

  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<GithubSummary> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'features' },
      select: { value: true },
    });
    const value = setting?.value;
    if (
      typeof value === 'object' &&
      value !== null &&
      'githubActivity' in value &&
      value.githubActivity === false
    ) {
      throw new ServiceUnavailableException('GitHub activity is disabled.');
    }
    if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.value;

    const profile = await this.prisma.profile.findFirst({ select: { socialLinks: true } });
    const links = profile?.socialLinks;
    const githubLink =
      typeof links === 'object' && links !== null && 'github' in links ? links.github : null;
    const username = process.env.GITHUB_USERNAME ?? this.usernameFrom(githubLink);
    if (!username) throw new ServiceUnavailableException('GitHub profile is not configured.');

    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const [userResponse, repoResponse, activityResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        signal: AbortSignal.timeout(5000),
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
        { headers, signal: AbortSignal.timeout(5000) },
      ),
      fetch(
        process.env.GITHUB_TOKEN
          ? 'https://api.github.com/graphql'
          : `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`,
        {
          method: process.env.GITHUB_TOKEN ? 'POST' : 'GET',
          headers: {
            ...headers,
            ...(process.env.GITHUB_TOKEN ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(process.env.GITHUB_TOKEN
            ? {
                body: JSON.stringify({
                  query:
                    'query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions}}}}',
                  variables: {
                    login: username,
                    from: new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString(),
                    to: new Date().toISOString(),
                  },
                }),
              }
            : {}),
          signal: AbortSignal.timeout(5000),
        },
      ),
    ]);
    if (!userResponse.ok || !repoResponse.ok || !activityResponse.ok)
      throw new ServiceUnavailableException('GitHub summary is temporarily unavailable.');
    const user = (await userResponse.json()) as GithubUser;
    const repos = (await repoResponse.json()) as GithubRepo[];
    const activity = process.env.GITHUB_TOKEN
      ? ((await activityResponse.json()) as GithubGraphqlResponse)
      : ((await activityResponse.json()) as GithubEvent[]);
    const since = Date.now() - 30 * 24 * 60 * 60_000;
    const recentPublicEvents = Array.isArray(activity)
      ? activity.filter((event) => Date.parse(event.created_at) >= since).length
      : 0;
    const contributionsLast30Days = Array.isArray(activity)
      ? null
      : (activity.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ??
        null);
    const languages = new Map<string, number>();
    for (const repo of repos)
      if (repo.language) languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
    const summary: GithubSummary = {
      username: user.login,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      contributionsLast30Days,
      recentPublicEvents,
      topLanguages: [...languages]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([language, count]) => ({ language, count })),
      featuredRepos: [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((repo) => ({
          name: repo.name,
          stars: repo.stargazers_count,
          language: repo.language,
          url: repo.html_url,
        })),
      cachedAt: new Date().toISOString(),
    };
    this.cached = { value: summary, expiresAt: Date.now() + 15 * 60_000 };
    return summary;
  }

  private usernameFrom(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
      return new URL(value).pathname.split('/').filter(Boolean)[0] ?? null;
    } catch {
      return value.trim() || null;
    }
  }
}
