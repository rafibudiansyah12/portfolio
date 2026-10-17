import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import {
  PaginationQuerySchema,
  PostListQuery,
  PostListQuerySchema,
  ProjectListQuery,
  ProjectListQuerySchema,
  PaginationQuery,
} from '@portfolio/shared';
import sanitizeHtml from 'sanitize-html';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ZodValidationPipe } from '../auth/auth.validation.pipe';
import { GithubSummaryService } from './github-summary.service';

const publicStatuses = {
  status: 'PUBLISHED' as const,
  AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] }],
};
const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'a',
    'blockquote',
    'br',
    'code',
    'em',
    'h2',
    'h3',
    'h4',
    'hr',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'strong',
    'ul',
  ],
  allowedAttributes: { a: ['href'], img: ['src', 'alt', 'title'] },
  allowedSchemes: ['http', 'https', 'mailto'],
};

@Controller()
@ApiTags('public content')
export class PublicContentController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubSummary: GithubSummaryService,
  ) {}

  @Get('projects')
  async projects(@Query(new ZodValidationPipe(ProjectListQuerySchema)) query: ProjectListQuery) {
    const where = {
      ...publicStatuses,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              { summary: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.skill
        ? {
            skills: {
              some: { skill: { name: { equals: query.skill, mode: 'insensitive' as const } } },
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        include: {
          skills: { include: { skill: true } },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { id: true, caption: true, media: { select: { url: true } } },
          },
          reactions: { select: { emoji: true, count: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('projects/:slug')
  async project(@Param('slug') slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { ...publicStatuses, slug },
      include: {
        skills: { include: { skill: true } },
        images: {
          orderBy: { order: 'asc' },
          select: { id: true, caption: true, order: true, media: { select: { url: true } } },
        },
        reactions: { select: { emoji: true, count: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return {
      ...project,
      problem: sanitizeHtml(project.problem, richTextOptions),
      solution: sanitizeHtml(project.solution, richTextOptions),
      result: sanitizeHtml(project.result, richTextOptions),
    };
  }

  @Get('skills')
  skills() {
    return this.prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  @Get('experiences')
  experiences() {
    return this.prisma.experience.findMany({ orderBy: [{ startDate: 'desc' }, { order: 'asc' }] });
  }

  @Get('profile')
  async profile() {
    const profile = await this.prisma.profile.findFirst();
    if (!profile) throw new NotFoundException('Profile is not configured yet.');
    return profile;
  }

  @Get('posts')
  async posts(@Query(new ZodValidationPipe(PostListQuerySchema)) query: PostListQuery) {
    const where = {
      status: 'PUBLISHED' as const,
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.q
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: query.q, mode: 'insensitive' as const } },
                  { excerpt: { contains: query.q, mode: 'insensitive' as const } },
                ],
              },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverUrl: true,
          publishedAt: true,
          tags: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('posts/:slug')
  async post(@Param('slug') slug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        status: 'PUBLISHED',
        slug,
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      },
    });
    if (!post) throw new NotFoundException('Post not found.');
    return { ...post, content: sanitizeHtml(post.content, richTextOptions) };
  }

  @Get('settings/public')
  async publicSettings() {
    const allowedKeys = ['site_title', 'seo_description', 'theme', 'features'];
    const settings = await this.prisma.siteSetting.findMany({
      where: { key: { in: allowedKeys } },
      select: { key: true, value: true },
    });
    return settings;
  }

  @Get('github/summary')
  async github() {
    return this.githubSummary.getSummary();
  }

  @Get('guestbook')
  async guestbook(
    @Query(new ZodValidationPipe(PaginationQuerySchema)) query: { page: number; limit: number },
  ) {
    const where = { approved: true };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, message: true, createdAt: true },
      }),
      this.prisma.guestbookEntry.count({ where }),
    ]);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('testimonials')
  async testimonials(@Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQuery) {
    const where = { approved: true };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.testimonial.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, authorName: true, authorRole: true, message: true, createdAt: true },
      }),
      this.prisma.testimonial.count({ where }),
    ]);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
