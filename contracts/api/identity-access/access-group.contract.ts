import { z } from 'zod';
import { ActorId } from './actor.contract';

export const AccessGroupId = z.string().uuid();
export type AccessGroupId = z.infer<typeof AccessGroupId>;

export const AccessGroup = z.object({
  id: AccessGroupId,
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  communityId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
export type AccessGroup = z.infer<typeof AccessGroup>;

export const AccessGroupMember = z.object({
  accessGroupId: AccessGroupId,
  actorId: ActorId,
  addedAt: z.string().datetime(),
});
export type AccessGroupMember = z.infer<typeof AccessGroupMember>;
