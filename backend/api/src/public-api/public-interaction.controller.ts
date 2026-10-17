import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  MessageEvent,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Sse,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import {
  ContactInput,
  ContactInputSchema,
  GuestbookInput,
  GuestbookInputSchema,
  PageViewInput,
  PageViewInputSchema,
  SubscribeInput,
  SubscribeInputSchema,
  ProjectReactionSchema,
} from '@portfolio/shared';
import { Request } from 'express';
import { ZodValidationPipe } from '../auth/auth.validation.pipe';
import { PrismaService } from '../prisma/prisma.service';
import { ResendNotificationService } from '../notifications/resend-notification.service';
import { createHash, randomBytes } from 'node:crypto';
import { concatMap, Observable, timer } from 'rxjs';

@Controller()
@ApiTags('public submissions')
export class PublicInteractionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: ResendNotificationService,
  ) {}

  @Post('contact')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async contact(@Body(new ZodValidationPipe(ContactInputSchema)) body: ContactInput) {
    if (body.website) return { accepted: true };
    await this.prisma.contactMessage.create({
      data: { name: body.name, email: body.email, subject: body.subject, message: body.message },
    });
    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
    if (notifyEmail) {
      await this.notifications.send(
        notifyEmail,
        `Portfolio contact: ${body.subject}`,
        `From: ${body.name} <${body.email}>\n\n${body.message}`,
      );
    }
    return { accepted: true };
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async subscribe(@Body(new ZodValidationPipe(SubscribeInputSchema)) body: SubscribeInput) {
    if (body.website) return { accepted: true };
    if (!(await this.featureEnabled('newsletter'))) return { accepted: true, disabled: true };
    const email = body.email.toLowerCase();
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        confirmationTokenHash: tokenHash,
        confirmationExpiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      },
      update: {
        confirmationTokenHash: tokenHash,
        confirmationExpiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      },
    });
    const baseUrl =
      process.env.PUBLIC_SITE_URL ?? process.env.WEB_ORIGIN ?? 'http://localhost:3000';
    const delivered = await this.notifications.send(
      email,
      'Confirm your newsletter subscription',
      `Confirm your subscription: ${baseUrl.replace(/\/$/, '')}/api/v1/subscribe/confirm?token=${token}\n\nThis link expires in 24 hours.`,
    );
    if (!delivered)
      throw new ServiceUnavailableException('Subscription confirmation email is not configured.');
    return { accepted: true };
  }

  @Get('subscribe/confirm')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async confirmSubscription(@Query('token') token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      throw new NotFoundException('Subscription link is invalid or expired.');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const subscriber = await this.prisma.subscriber.findFirst({
      where: { confirmationTokenHash: tokenHash, confirmationExpiresAt: { gt: new Date() } },
    });
    if (!subscriber) throw new NotFoundException('Subscription link is invalid or expired.');
    await this.prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { confirmedAt: new Date(), confirmationTokenHash: null, confirmationExpiresAt: null },
    });
    return { confirmed: true, message: 'Subscription confirmed.' };
  }

  @Post('guestbook')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async createGuestbookEntry(
    @Body(new ZodValidationPipe(GuestbookInputSchema)) body: GuestbookInput,
  ) {
    if (body.website) return { accepted: true };
    await this.prisma.guestbookEntry.create({
      data: { name: body.name, message: body.message, approved: false },
    });
    return { accepted: true, moderation: 'pending' };
  }

  @Post('views')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async recordView(
    @Body(new ZodValidationPipe(PageViewInputSchema)) body: PageViewInput,
    @Req() request: Request,
    @Headers('cf-ipcountry') countryHeader?: string,
  ) {
    if (!(await this.featureEnabled('viewCounter'))) return { accepted: true, recorded: false };
    const path = new URL(body.path, 'http://localhost').pathname;
    const refererHeader = request.get('referer');
    const referrer = this.safeOrigin(refererHeader);
    const country =
      countryHeader && /^[A-Za-z]{2}$/.test(countryHeader) ? countryHeader.toUpperCase() : null;

    await this.prisma.$transaction(async (transaction) => {
      let projectId: string | null = null;
      if (body.projectSlug) {
        const project = await transaction.project.findFirst({
          where: {
            slug: body.projectSlug,
            status: 'PUBLISHED',
            OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
          },
          select: { id: true },
        });
        if (!project) return;
        projectId = project.id;
        await transaction.project.update({
          where: { id: project.id },
          data: { viewCount: { increment: 1 } },
        });
      }

      await transaction.pageView.create({
        data: { path, projectId, referrer, country },
      });
    });

    return { accepted: true };
  }

  @Post('projects/:slug/reactions')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async react(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(ProjectReactionSchema)) body: { emoji: string },
  ) {
    if (!(await this.featureEnabled('projectReactions'))) return { accepted: true, disabled: true };
    const project = await this.prisma.project.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
      },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found.');
    await this.prisma.projectReaction.upsert({
      where: { projectId_emoji: { projectId: project.id, emoji: body.emoji } },
      create: { projectId: project.id, emoji: body.emoji, count: 1 },
      update: { count: { increment: 1 } },
    });
    return {
      accepted: true,
      reactions: await this.prisma.projectReaction.findMany({
        where: { projectId: project.id },
        select: { emoji: true, count: true },
      }),
    };
  }

  @Sse('guestbook/stream')
  streamGuestbook(@Query('since') since?: string): Observable<MessageEvent> {
    let cursor = since && Number.isFinite(Date.parse(since)) ? new Date(since) : new Date();
    return timer(0, 5000).pipe(
      concatMap(async () => {
        if (!(await this.featureEnabled('guestbookRealtime')))
          return { type: 'disabled', data: [] };
        const entries = await this.prisma.guestbookEntry.findMany({
          where: { approved: true, createdAt: { gt: cursor } },
          orderBy: { createdAt: 'asc' },
          take: 50,
          select: { id: true, name: true, message: true, createdAt: true },
        });
        if (entries.length) cursor = entries[entries.length - 1]!.createdAt;
        return { type: 'guestbook', data: entries };
      }),
    );
  }

  private async featureEnabled(feature: string): Promise<boolean> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'features' },
      select: { value: true },
    });
    const value = setting?.value;
    return !(
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      feature in value &&
      value[feature] === false
    );
  }

  private safeOrigin(value?: string): string | null {
    if (!value) return null;
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  }
}
