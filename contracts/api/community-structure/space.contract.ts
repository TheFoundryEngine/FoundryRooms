import { z } from 'zod';
import { CommunityId } from './community.contract';

export const SpaceId = z.string().uuid();
export type SpaceId = z.infer<typeof SpaceId>;

export const SpaceVisibility = z.enum(['public', 'members', 'restricted']);
export type SpaceVisibility = z.infer<typeof SpaceVisibility>;

export const Space = z.object({
  id: SpaceId,
  communityId: CommunityId,
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(50),
  description: z.string().max(500).nullable(),
  visibility: SpaceVisibility,
  iconEmoji: z.string().max(10).nullable(),
  order: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type Space = z.infer<typeof Space>;

export const CreateSpaceRequest = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(50),
  description: z.string().max(500).optional(),
  visibility: SpaceVisibility.default('members'),
  iconEmoji: z.string().max(10).optional(),
});
export type CreateSpaceRequest = z.infer<typeof CreateSpaceRequest>;
