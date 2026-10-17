import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { AdminApiModule } from './admin/admin-api.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PublicApiModule } from './public-api/public-api.module';
import { PublishScheduledProjectsJob } from './scheduling/publish-scheduled-projects.job';

@Controller()
class HelloController {
  @Get()
  hello() {
    return { message: 'Hello from Portfolio API' };
  }
}

@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'connected',
      service: 'portfolio-api',
      timestamp: new Date().toISOString(),
    };
  }
}

@Module({
  imports: [
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          censor: '[REDACTED]',
        },
      },
    }),
    AuthModule,
    AdminApiModule,
    PublicApiModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController, HelloController],
  providers: [PublishScheduledProjectsJob, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
