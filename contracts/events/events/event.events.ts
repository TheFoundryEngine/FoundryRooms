import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const EventId = z.string().uuid();
const ActorId = z.string().uuid();
const CommunityId = z.string().uuid();

export const EventCreated = createEventSchema(
  'events.event.created',
  'event',
  {
    eventId: EventId,
    communityId: CommunityId,
    hostActorId: ActorId,
    title: z.string(),
    scheduledAt: z.string().datetime(),
    visibility: z.string(),
  },
);
export type EventCreated = InferEvent<typeof EventCreated>;

export const EventScheduled = createEventSchema(
  'events.event.scheduled',
  'event',
  {
    eventId: EventId,
    communityId: CommunityId,
    hostActorId: ActorId,
    scheduledAt: z.string().datetime(),
  },
);
export type EventScheduled = InferEvent<typeof EventScheduled>;

export const EventUpdated = createEventSchema(
  'events.event.updated',
  'event',
  {
    eventId: EventId,
    hostActorId: ActorId,
  },
);
export type EventUpdated = InferEvent<typeof EventUpdated>;

export const EventCancelled = createEventSchema(
  'events.event.cancelled',
  'event',
  {
    eventId: EventId,
    hostActorId: ActorId,
    reason: z.string().nullable(),
  },
);
export type EventCancelled = InferEvent<typeof EventCancelled>;
