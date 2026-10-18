import { z } from 'zod';
import { SiteFeaturesPatchSchema } from './features.js';

export const AdminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).max(100).optional(),
});
export type AdminListQuery = z.infer<typeof AdminListQuerySchema>;

export const AdminProjectQuerySchema = AdminListQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).optional(),
});
export type AdminProjectQuery = z.infer<typeof AdminProjectQuerySchema>;

export const ProjectReorderSchema = z.object({
  projectIds: z
    .array(z.string().uuid())
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length),
});
export type ProjectReorderInput = z.infer<typeof ProjectReorderSchema>;

export const ProjectImageInputSchema = z.object({
  mediaId: z.string().uuid(),
  caption: z.string().trim().max(250).nullable().optional(),
  order: z.number().int().min(0).default(0),
});

const ProjectCreateBaseSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  summary: z.string().trim().min(1).max(1000),
  client: z.string().trim().max(180).nullable().optional(),
  problem: z.string().max(20000),
  solution: z.string().max(20000),
  result: z.string().max(20000),
  thumbnailUrl: z.string().url().nullable().optional(),
  repoUrl: z.string().url().nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  publishAt: z.string().datetime().nullable().optional(),
  seoTitle: z.string().trim().max(180).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  skillIds: z.array(z.string().uuid()).max(50).default([]),
  images: z.array(ProjectImageInputSchema).max(50).default([]),
});
export const ProjectCreateSchema = ProjectCreateBaseSchema.refine(
  (project) => project.status !== 'SCHEDULED' || Boolean(project.publishAt),
  {
    message: 'Set publishAt when scheduling a project.',
    path: ['publishAt'],
  },
);
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export const ProjectUpdateSchema = ProjectCreateBaseSchema.partial()
  .omit({ skillIds: true, images: true })
  .extend({
    skillIds: ProjectCreateBaseSchema.shape.skillIds.optional(),
    images: ProjectCreateBaseSchema.shape.images.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one project field to update.',
  });
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

export const SkillInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(80),
  level: z.number().int().min(0).max(100).nullable().optional(),
  icon: z.string().trim().max(120).nullable().optional(),
});
export type SkillInput = z.infer<typeof SkillInputSchema>;

export const ExperienceInputSchema = z.object({
  type: z.enum(['WORK', 'ORGANIZATION', 'EDUCATION']),
  title: z.string().trim().min(1).max(180),
  organization: z.string().trim().min(1).max(180),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  description: z.string().trim().min(1).max(20000),
  order: z.number().int().default(0),
});
export type ExperienceInput = z.infer<typeof ExperienceInputSchema>;

export const ProfilePatchSchema = z.object({
  headline: z.string().trim().max(240).optional(),
  bio: z.string().max(20000).optional(),
  photoUrl: z.string().url().nullable().optional(),
  cvUrl: z.string().url().nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
  availability: z.boolean().optional(),
  socialLinks: z.record(z.string().url()).optional(),
});
export type ProfilePatchInput = z.infer<typeof ProfilePatchSchema>;

export const AdminPostQuerySchema = AdminListQuerySchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});
export type AdminPostQuery = z.infer<typeof AdminPostQuerySchema>;

export const PostCreateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  excerpt: z.string().trim().min(1).max(2000),
  content: z.string().max(50000),
  coverUrl: z.string().url().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.string().datetime().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
});
export type PostCreateInput = z.infer<typeof PostCreateSchema>;
export const PostUpdateSchema = PostCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'Provide at least one post field to update.',
  },
);
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>;

export const TestimonialInputSchema = z.object({
  authorName: z.string().trim().min(2).max(100),
  authorRole: z.string().trim().max(160).nullable().optional(),
  message: z.string().trim().min(2).max(3000),
  approved: z.boolean().default(false),
});
export type TestimonialInput = z.infer<typeof TestimonialInputSchema>;
export const TestimonialUpdateSchema = TestimonialInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
);

export const ModerationSchema = z.object({ approved: z.boolean() });
export const MessageStateSchema = z
  .object({ isRead: z.boolean().optional(), isArchived: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0);
export const ReplyMessageSchema = z.object({ message: z.string().trim().min(1).max(5000) });

const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);
export const SiteSettingsPatchSchema = z
  .object({
    settings: z
      .record(z.string().trim().min(1).max(100), JsonValueSchema)
      .refine((value) => Object.keys(value).length > 0),
  })
  .superRefine((value, context) => {
    if (value.settings.features === undefined) return;
    const parsed = SiteFeaturesPatchSchema.safeParse(value.settings.features);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        context.addIssue({ ...issue, path: ['settings', 'features', ...issue.path] });
    }
  });

export const AuditLogQuerySchema = AdminListQuerySchema.extend({
  entity: z.string().trim().min(1).max(100).optional(),
  action: z.string().trim().min(1).max(100).optional(),
});
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
