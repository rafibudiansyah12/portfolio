import { z } from 'zod';

export const LocaleSchema = z.enum(['id', 'en']);
export type Locale = z.infer<typeof LocaleSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  error: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
