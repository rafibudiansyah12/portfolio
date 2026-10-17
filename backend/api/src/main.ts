import 'reflect-metadata';
import dotenv from 'dotenv';
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';

// Load API-local configuration when started from the monorepo root, then allow
// root-level variables to fill any values that were not defined locally.
dotenv.config({ path: resolve(process.cwd(), 'backend/api/.env') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(helmet());
  app.use(cookieParser());
  const allowedOrigins = new Set(
    [process.env.WEB_ORIGIN, process.env.DASHBOARD_ORIGIN].filter((origin): origin is string =>
      Boolean(origin),
    ),
  );
  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('REST API for public portfolio content and the admin dashboard.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, { useGlobalPrefix: false });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
