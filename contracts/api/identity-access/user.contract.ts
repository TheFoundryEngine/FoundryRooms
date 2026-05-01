import { z } from 'zod';
import { ActorBase, ActorSummary } from './actor.contract';

export const Email = z.string().email();
export type Email = z.infer<typeof Email>;

export const User = ActorBase.extend({
  type: z.literal('user'),
  email: Email,
  emailVerified: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type User = z.infer<typeof User>;

export const UserSummary = ActorSummary.extend({
  type: z.literal('user'),
  email: Email,
});
export type UserSummary = z.infer<typeof UserSummary>;

export const UserProfile = User.extend({
  bio: z.string().max(500).nullable(),
  location: z.string().max(100).nullable(),
  website: z.string().url().nullable(),
  timezone: z.string().nullable(),
});
export type UserProfile = z.infer<typeof UserProfile>;

export const CreateUserRequest = z.object({
  email: Email,
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});
export type CreateUserRequest = z.infer<typeof CreateUserRequest>;
