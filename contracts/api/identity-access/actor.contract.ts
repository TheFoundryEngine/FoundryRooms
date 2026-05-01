import { z } from 'zod';

export const ActorType = z.enum(['user', 'agent']);
export type ActorType = z.infer<typeof ActorType>;

export const ActorId = z.string().uuid();
export type ActorId = z.infer<typeof ActorId>;

export const ActorBase = z.object({
  id: ActorId,
  type: ActorType,
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean(),
});
export type ActorBase = z.infer<typeof ActorBase>;

export const ActorSummary = z.object({
  id: ActorId,
  type: ActorType,
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
});
export type ActorSummary = z.infer<typeof ActorSummary>;
