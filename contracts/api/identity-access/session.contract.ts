import { z } from 'zod';
import { ActorId, ActorType } from './actor.contract';

export const SessionId = z.string().uuid();
export type SessionId = z.infer<typeof SessionId>;

export const Session = z.object({
  id: SessionId,
  actorId: ActorId,
  actorType: ActorType,
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  lastAccessedAt: z.string().datetime(),
});
export type Session = z.infer<typeof Session>;

export const SessionToken = z.string().min(32);
export type SessionToken = z.infer<typeof SessionToken>;
