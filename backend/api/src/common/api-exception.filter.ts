import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponse = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = exception instanceof HttpException ? exception.getResponse() : undefined;
    const detailRecord = isRecord(details) ? details : undefined;
    const detailMessage = detailRecord?.message;
    const message =
      typeof detailMessage === 'string' || Array.isArray(detailMessage)
        ? (detailMessage as string | string[])
        : typeof details === 'string'
          ? details
          : statusCode >= 500
            ? 'Internal server error.'
            : 'Request failed.';
    const error = typeof detailRecord?.error === 'string' ? detailRecord.error : 'Request Error';
    const payload: ErrorResponse = {
      statusCode,
      error,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${request.method} ${request.originalUrl} returned ${statusCode}`, stack);
    }
    response.status(statusCode).json(payload);
  }
}
