import { z } from 'zod';

export const ProjectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().min(1).max(100).optional(),
  skill: z.string().trim().min(1).max(80).optional(),
});
export type ProjectListQuery = z.infer<typeof ProjectListQuerySchema>;

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().min(1).max(100).optional(),
  tag: z.string().trim().min(1).max(50).optional(),
});
export type PostListQuery = z.infer<typeof PostListQuerySchema>;

const PlainTextSchema = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((value) => !/<[^>]*>/.test(value), {
      message: 'HTML markup is not allowed.',
    });

export const ContactInputSchema = z.object({
  name: PlainTextSchema(2, 100),
  email: z.string().trim().email().max(254),
  subject: PlainTextSchema(3, 160),
  message: PlainTextSchema(10, 5000),
  website: z.string().max(200).default(''),
});
export type ContactInput = z.infer<typeof ContactInputSchema>;

export const GuestbookInputSchema = z.object({
  name: PlainTextSchema(2, 100),
  message: PlainTextSchema(2, 500),
  website: z.string().max(200).default(''),
});
export type GuestbookInput = z.infer<typeof GuestbookInputSchema>;

export const PageViewInputSchema = z.object({
  path: z.string().trim().startsWith('/').max(512),
  projectSlug: z.string().trim().min(1).max(120).optional(),
});
export type PageViewInput = z.infer<typeof PageViewInputSchema>;

export const SubscribeInputSchema = z.object({
  email: z.string().trim().email().max(254),
  website: z.string().max(200).default(''),
});
export type SubscribeInput = z.infer<typeof SubscribeInputSchema>;
