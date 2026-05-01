import { z } from 'zod';
import { SpaceId } from './space.contract';

export const ChannelId = z.string().uuid();
export type ChannelId = z.infer<typeof ChannelId>;

export const ChannelType = z.enum(['discussion', 'announcements', 'events', 'resources']);
export type ChannelType = z.infer<typeof ChannelType>;

export const ChannelVisibility = z.enum(['public', 'members', 'restricted']);
export type ChannelVisibility = z.infer<typeof ChannelVisibility>;

export const Channel = z.object({
  id: ChannelId,
  spaceId: SpaceId,
  name: z.string().min(1).max(100),
  type: ChannelType,
  description: z.string().max(500).nullable(),
  visibility: ChannelVisibility,
  order: z.number().int().nonnegative(),
  settings: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
});
export type Channel = z.infer<typeof Channel>;

export const CreateChannelRequest = z.object({
  name: z.string().min(1).max(100),
  type: ChannelType.default('discussion'),
  description: z.string().max(500).optional(),
  visibility: ChannelVisibility.default('members'),
});
export type CreateChannelRequest = z.infer<typeof CreateChannelRequest>;
