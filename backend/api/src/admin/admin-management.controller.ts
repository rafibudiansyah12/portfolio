import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v2 as cloudinary } from 'cloudinary';
import {
  AdminListQuery,
  AdminListQuerySchema,
  AdminPostQuery,
  AdminPostQuerySchema,
  AuditLogQuery,
  AuditLogQuerySchema,
  MessageStateSchema,
  ModerationSchema,
  PostCreateInput,
  PostCreateSchema,
  PostUpdateInput,
  PostUpdateSchema,
  ReplyMessageSchema,
  SiteSettingsPatchSchema,
  TestimonialInput,
  TestimonialInputSchema,
  TestimonialUpdateSchema,
} from '@portfolio/shared';
import { Role } from '../generated/prisma/client';
import { ZodValidationPipe } from '../auth/auth.validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import type {} from 'multer';

function actorId(request: RequestWithUser): string {
  if (!request.user) throw new UnauthorizedException('Authenticated user is missing.');
  return request.user.sub;
}

function pageResult<T>(items: T[], total: number, query: AdminListQuery) {
  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

function slugify(value: string): string {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post'
  );
}

function isUniqueConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin posts')
export class AdminPostsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminPostQuerySchema)) query: AdminPostQuery) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              { slug: { contains: query.q, mode: 'insensitive' as const } },
              { excerpt: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: query.limit, orderBy: { updatedAt: 'desc' } }),
      this.prisma.post.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Get(':id')
  async get(@Param('id', new ZodValidationPipe(z.string().uuid())) id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found.');
    return post;
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(PostCreateSchema)) body: PostCreateInput,
  ) {
    let slug = body.slug ?? slugify(body.title);
    if (body.slug === undefined) {
      const baseSlug = slug;
      let suffix = 2;
      while (await this.prisma.post.findUnique({ where: { slug }, select: { id: true } }))
        slug = `${baseSlug}-${suffix++}`;
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
          data: {
            title: body.title,
            slug,
            excerpt: body.excerpt,
            content: body.content,
            coverUrl: body.coverUrl ?? null,
            status: body.status,
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
            tags: body.tags,
          },
        });
        await tx.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'CREATE',
            entity: 'Post',
            entityId: post.id,
            meta: { title: post.title, slug: post.slug },
          },
        });
        return post;
      });
    } catch (error) {
      if (isUniqueConflict(error))
        throw new ConflictException('A post with this slug already exists.');
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(PostUpdateSchema)) body: PostUpdateInput,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const current = await tx.post.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Post not found.');
        const post = await tx.post.update({
          where: { id },
          data: {
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.slug !== undefined ? { slug: body.slug } : {}),
            ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
            ...(body.content !== undefined ? { content: body.content } : {}),
            ...(body.coverUrl !== undefined ? { coverUrl: body.coverUrl } : {}),
            ...(body.status !== undefined ? { status: body.status } : {}),
            ...(body.publishedAt !== undefined
              ? { publishedAt: body.publishedAt ? new Date(body.publishedAt) : null }
              : {}),
            ...(body.tags !== undefined ? { tags: body.tags } : {}),
          },
        });
        await tx.auditLog.create({
          data: {
            userId: actorId(request),
            action: 'UPDATE',
            entity: 'Post',
            entityId: post.id,
            meta: { previousSlug: current.slug, slug: post.slug },
          },
        });
        return post;
      });
    } catch (error) {
      if (isUniqueConflict(error))
        throw new ConflictException('A post with this slug already exists.');
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id },
        select: { id: true, title: true, slug: true },
      });
      if (!post) throw new NotFoundException('Post not found.');
      await tx.post.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Post',
          entityId: post.id,
          meta: { title: post.title, slug: post.slug },
        },
      });
      return { deleted: true };
    });
  }
}

@Controller('admin/testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin testimonials')
export class AdminTestimonialsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { authorName: { contains: query.q, mode: 'insensitive' as const } },
            { authorRole: { contains: query.q, mode: 'insensitive' as const } },
            { message: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.testimonial.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.testimonial.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Post()
  async create(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(TestimonialInputSchema)) body: TestimonialInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const testimonial = await tx.testimonial.create({ data: body });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'CREATE',
          entity: 'Testimonial',
          entityId: testimonial.id,
          meta: { authorName: testimonial.authorName, approved: testimonial.approved },
        },
      });
      return testimonial;
    });
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(TestimonialUpdateSchema)) body: Partial<TestimonialInput>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.testimonial.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Testimonial not found.');
      const testimonial = await tx.testimonial.update({ where: { id }, data: body });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'UPDATE',
          entity: 'Testimonial',
          entityId: id,
          meta: { approved: testimonial.approved },
        },
      });
      return testimonial;
    });
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.testimonial.findUnique({
        where: { id },
        select: { id: true, authorName: true },
      });
      if (!current) throw new NotFoundException('Testimonial not found.');
      await tx.testimonial.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Testimonial',
          entityId: id,
          meta: { authorName: current.authorName },
        },
      });
      return { deleted: true };
    });
  }
}

@Controller('admin/guestbook')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin guestbook')
export class AdminGuestbookController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { message: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guestbookEntry.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Patch(':id')
  async moderate(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(ModerationSchema)) body: { approved: boolean },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.guestbookEntry.findUnique({ where: { id } });
      if (!entry) throw new NotFoundException('Guestbook entry not found.');
      const updated = await tx.guestbookEntry.update({ where: { id }, data: body });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: body.approved ? 'APPROVE' : 'REJECT',
          entity: 'GuestbookEntry',
          entityId: id,
          meta: { name: entry.name },
        },
      });
      return updated;
    });
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.guestbookEntry.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
      if (!entry) throw new NotFoundException('Guestbook entry not found.');
      await tx.guestbookEntry.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'GuestbookEntry',
          entityId: id,
          meta: { name: entry.name },
        },
      });
      return { deleted: true };
    });
  }
}

@Controller('admin/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin messages')
export class AdminMessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
            { subject: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total, unread] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    ]);
    return { ...pageResult(items, total, query), unread };
  }

  @Patch(':id')
  async updateState(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(MessageStateSchema))
    body: { isRead?: boolean; isArchived?: boolean },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (!(await tx.contactMessage.findUnique({ where: { id }, select: { id: true } })))
        throw new NotFoundException('Message not found.');
      const message = await tx.contactMessage.update({ where: { id }, data: body });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'UPDATE_STATE',
          entity: 'ContactMessage',
          entityId: id,
          meta: { isRead: message.isRead, isArchived: message.isArchived },
        },
      });
      return message;
    });
  }

  @Post(':id/reply')
  async reply(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    @Body(new ZodValidationPipe(ReplyMessageSchema)) body: { message: string },
  ) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found.');
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from)
      throw new ServiceUnavailableException('Email delivery is not configured.');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [message.email],
        subject: `Re: ${message.subject}`,
        text: body.message,
      }),
    });
    if (!response.ok) throw new ServiceUnavailableException('Email provider rejected the reply.');
    await this.prisma.$transaction([
      this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } }),
      this.prisma.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'REPLY',
          entity: 'ContactMessage',
          entityId: id,
          meta: { email: message.email },
        },
      }),
    ]);
    return { sent: true };
  }
}

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiTags('admin settings')
export class AdminSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  @Patch()
  async patch(
    @Req() request: RequestWithUser,
    @Body(new ZodValidationPipe(SiteSettingsPatchSchema))
    body: { settings: Record<string, unknown> },
  ) {
    const userId = actorId(request);
    return this.prisma.$transaction(async (tx) => {
      const settings = await Promise.all(
        Object.entries(body.settings).map(([key, value]) =>
          tx.siteSetting.upsert({
            where: { key },
            create: { key, value: value as never },
            update: { value: value as never },
          }),
        ),
      );
      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'SiteSetting',
          entityId: null,
          meta: { keys: Object.keys(body.settings) },
        },
      });
      return settings;
    });
  }
}

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiTags('admin audit logs')
export class AdminAuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AuditLogQuerySchema)) query: AuditLogQuery) {
    const where = {
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.action ? { action: query.action } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return pageResult(items, total, query);
  }
}

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin analytics')
export class AdminAnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async summary() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 29);
    const views = await this.prisma.pageView.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, project: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const daily = new Map<string, number>();
    for (let offset = 0; offset < 30; offset++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + offset);
      daily.set(day.toISOString().slice(0, 10), 0);
    }
    const projects = new Map<string, { title: string; slug: string; views: number }>();
    for (const view of views) {
      const date = view.createdAt.toISOString().slice(0, 10);
      daily.set(date, (daily.get(date) ?? 0) + 1);
      if (view.project) {
        const current = projects.get(view.project.slug) ?? { ...view.project, views: 0 };
        current.views += 1;
        projects.set(view.project.slug, current);
      }
    }
    return {
      totalViews: views.length,
      dailyViews: [...daily].map(([date, count]) => ({ date, views: count })),
      projectViews: [...projects.values()].sort((a, b) => b.views - a.views).slice(0, 10),
    };
  }
}

@Controller('admin/subscribers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin subscribers')
export class AdminSubscribersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = {
      confirmedAt: { not: null },
      ...(query.q ? { email: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.subscriber.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { email: 'asc' },
      }),
      this.prisma.subscriber.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const subscriber = await tx.subscriber.findUnique({
        where: { id },
        select: { id: true, email: true },
      });
      if (!subscriber) throw new NotFoundException('Subscriber not found.');
      await tx.subscriber.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Subscriber',
          entityId: id,
          meta: { email: subscriber.email },
        },
      });
      return { deleted: true };
    });
  }
}

const uploadSchema = z.object({
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
});

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR)
@ApiBearerAuth()
@ApiTags('admin media')
export class AdminMediaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(AdminListQuerySchema)) query: AdminListQuery) {
    const where = query.q
      ? {
          OR: [
            { publicId: { contains: query.q, mode: 'insensitive' as const } },
            { url: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);
    return pageResult(items, total, query);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        const result = uploadSchema.safeParse({ mimetype: file.mimetype });
        callback(
          result.success
            ? null
            : new BadRequestException('Only JPG, PNG, WebP, GIF, or PDF files are allowed.'),
          result.success,
        );
      },
    }),
  )
  async upload(@Req() request: RequestWithUser, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('A file is required.');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret)
      throw new ServiceUnavailableException('Media storage is not configured.');
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const uploaded = await new Promise<{ secure_url: string; public_id: string; bytes: number }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: 'portfolio' },
          (error, result) => {
            if (error || !result) reject(new ServiceUnavailableException('Media upload failed.'));
            else
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                bytes: result.bytes,
              });
          },
        );
        stream.end(file.buffer);
      },
    );
    const userId = actorId(request);
    const type = resourceType === 'raw' ? 'DOCUMENT' : 'IMAGE';
    try {
      return await this.prisma.$transaction(async (tx) => {
        const media = await tx.media.create({
          data: {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            type,
            size: uploaded.bytes,
            uploadedById: userId,
          },
        });
        await tx.auditLog.create({
          data: {
            userId,
            action: 'UPLOAD',
            entity: 'Media',
            entityId: media.id,
            meta: { type: media.type, size: media.size },
          },
        });
        return media;
      });
    } catch (error) {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: resourceType });
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Req() request: RequestWithUser,
    @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
  ) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media item not found.');
    if (await this.prisma.projectImage.count({ where: { mediaId: id } }))
      throw new ConflictException('Remove this media from project galleries before deleting it.');
    await this.prisma.$transaction(async (tx) => {
      await tx.media.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          userId: actorId(request),
          action: 'DELETE',
          entity: 'Media',
          entityId: id,
          meta: { publicId: media.publicId, type: media.type },
        },
      });
    });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'DOCUMENT' ? 'raw' : 'image',
      });
    }
    return { deleted: true };
  }
}
