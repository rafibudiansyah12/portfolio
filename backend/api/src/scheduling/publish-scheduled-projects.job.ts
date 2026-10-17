import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishScheduledProjectsJob {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDueProjects(): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const dueProjects = await transaction.project.findMany({
        where: { status: 'SCHEDULED', publishAt: { lte: now } },
        select: { id: true, title: true, slug: true },
      });
      for (const project of dueProjects) {
        const published = await transaction.project.updateMany({
          where: { id: project.id, status: 'SCHEDULED', publishAt: { lte: now } },
          data: { status: 'PUBLISHED' },
        });
        if (published.count === 1) {
          await transaction.auditLog.create({
            data: {
              action: 'PUBLISH_SCHEDULED',
              entity: 'Project',
              entityId: project.id,
              meta: { title: project.title, slug: project.slug },
            },
          });
        }
      }
    });
  }
}
