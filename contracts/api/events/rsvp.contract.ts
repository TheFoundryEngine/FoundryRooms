import { z } from 'zod';

export const RsvpStatus = z.enum(['yes', 'no', 'maybe']);
export type RsvpStatus = z.infer<typeof RsvpStatus>;

export const RSVP = z.object({
  eventId: z.string().uuid(),
  actorId: z.string().uuid(),
  status: RsvpStatus,
  respondedAt: z.string().datetime(),
});
export type RSVP = z.infer<typeof RSVP>;

export const RsvpRequest = z.object({
  status: RsvpStatus,
});
export type RsvpRequest = z.infer<typeof RsvpRequest>;

export const CancelRsvpRequest = z.object({
  reason: z.string().optional(),
});
export type CancelRsvpRequest = z.infer<typeof CancelRsvpRequest>;
