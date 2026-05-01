import { z } from 'zod';

export const CommunityId = z.string().uuid();
export type CommunityId = z.infer<typeof CommunityId>;

export const CommunitySlug = z.string().regex(/^[a-z0-9-]+$/).min(3).max(50);
export type CommunitySlug = z.infer<typeof CommunitySlug>;

export const CommunityVisibility = z.enum(['public', 'private']);
export type CommunityVisibility = z.infer<typeof CommunityVisibility>;

export const Community = z.object({
  id: CommunityId,
  name: z.string().min(1).max(100),
  slug: CommunitySlug,
  description: z.string().max(500).nullable(),
  visibility: CommunityVisibility,
  iconUrl: z.string().url().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Community = z.infer<typeof Community>;

export const CommunitySummary = z.object({
  id: CommunityId,
  name: z.string(),
  slug: CommunitySlug,
  iconUrl: z.string().url().nullable(),
  visibility: CommunityVisibility,
});
export type CommunitySummary = z.infer<typeof CommunitySummary>;

export const CreateCommunityRequest = z.object({
  name: z.string().min(1).max(100),
  slug: CommunitySlug,
  description: z.string().max(500).optional(),
  visibility: CommunityVisibility.default('public'),
});
export type CreateCommunityRequest = z.infer<typeof CreateCommunityRequest>;
