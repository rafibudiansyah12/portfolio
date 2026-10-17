import { z } from 'zod';

export const SiteFeaturesSchema = z.object({
  blog: z.boolean().default(true),
  guestbook: z.boolean().default(true),
  chatbot: z.boolean().default(false),
  commandPalette: z.boolean().default(true),
  customCursor: z.boolean().default(false),
  pageTransitions: z.boolean().default(true),
  scrollProgress: z.boolean().default(true),
  githubActivity: z.boolean().default(false),
  cvPdf: z.boolean().default(true),
  dynamicOg: z.boolean().default(true),
  projectReactions: z.boolean().default(true),
  guestbookRealtime: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  openForWork: z.boolean().default(true),
  viewCounter: z.boolean().default(true),
  easterEgg: z.boolean().default(true),
});
export type SiteFeatures = z.infer<typeof SiteFeaturesSchema>;
export const SiteFeaturesPatchSchema = SiteFeaturesSchema.partial().strict();

export const ProjectReactionSchema = z.object({
  emoji: z.enum(['👍', '❤️', '🚀', '👏']),
});
export type ProjectReactionInput = z.infer<typeof ProjectReactionSchema>;
