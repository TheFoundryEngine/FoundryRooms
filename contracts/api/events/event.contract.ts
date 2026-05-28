import { z } from 'zod';

export const EventId = z.string().uuid();
export type EventId = z.infer<typeof EventId>;

export const EventVisibility = z.enum(['public', 'members_only', 'access_group', 'entitlement_gated']);
export type EventVisibility = z.infer<typeof EventVisibility>;

// Node 20 supports Intl.supportedValuesOf('timeZone') natively.
// Using z.string().min(1) as the fallback: the workspace lib target is ES2022 and
// Intl.supportedValuesOf availability varies by TypeScript version; to guarantee
// typecheck passes without pulling in a tz library, we accept any non-empty string.
export const Timezone = z.string().min(1);
export type Timezone = z.infer<typeof Timezone>;

export const Event = z.object({
  id: EventId,
  communityId: z.string().uuid(),
  hostActorId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  timezone: Timezone,
  visibility: EventVisibility,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Event = z.infer<typeof Event>;

export const EventSummary = z.object({
  id: EventId,
  communityId: z.string().uuid(),
  title: z.string(),
  scheduledAt: z.string().datetime(),
  visibility: EventVisibility,
});
export type EventSummary = z.infer<typeof EventSummary>;

export const CreateEventRequest = z.object({
  communityId: z.string().uuid(),
  hostActorId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  timezone: Timezone,
  visibility: EventVisibility,
});
export type CreateEventRequest = z.infer<typeof CreateEventRequest>;

export const UpdateEventRequest = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  timezone: Timezone.optional(),
  visibility: EventVisibility.optional(),
});
export type UpdateEventRequest = z.infer<typeof UpdateEventRequest>;

export const CancelEventRequest = z.object({
  reason: z.string().optional(),
});
export type CancelEventRequest = z.infer<typeof CancelEventRequest>;
