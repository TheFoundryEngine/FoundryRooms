import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const EventId = z.string().uuid();
const ActorId = z.string().uuid();

export const RSVPed = createEventSchema(
  'events.rsvp.created',
  'rsvp',
  {
    eventId: EventId,
    actorId: ActorId,
    status: z.enum(['yes', 'no', 'maybe']),
    respondedAt: z.string().datetime(),
  },
);
export type RSVPed = InferEvent<typeof RSVPed>;

export const RSVPCancelled = createEventSchema(
  'events.rsvp.cancelled',
  'rsvp',
  {
    eventId: EventId,
    actorId: ActorId,
  },
);
export type RSVPCancelled = InferEvent<typeof RSVPCancelled>;
