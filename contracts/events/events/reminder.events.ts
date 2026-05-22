import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const ReminderId = z.string().uuid();
const EventId = z.string().uuid();
const ActorId = z.string().uuid();

export const ReminderScheduled = createEventSchema(
  'events.reminder.scheduled',
  'reminder',
  {
    reminderId: ReminderId,
    eventId: EventId,
    targetActorId: ActorId,
    fireAt: z.string().datetime(),
  },
);
export type ReminderScheduled = InferEvent<typeof ReminderScheduled>;

export const ReminderSent = createEventSchema(
  'events.reminder.sent',
  'reminder',
  {
    reminderId: ReminderId,
    eventId: EventId,
    targetActorId: ActorId,
    sentAt: z.string().datetime(),
  },
);
export type ReminderSent = InferEvent<typeof ReminderSent>;

export const ReminderFailed = createEventSchema(
  'events.reminder.failed',
  'reminder',
  {
    reminderId: ReminderId,
    eventId: EventId,
    targetActorId: ActorId,
    reason: z.string(),
  },
);
export type ReminderFailed = InferEvent<typeof ReminderFailed>;

export const ReminderCancelled = createEventSchema(
  'events.reminder.cancelled',
  'reminder',
  {
    reminderId: ReminderId,
    eventId: EventId,
    targetActorId: ActorId,
  },
);
export type ReminderCancelled = InferEvent<typeof ReminderCancelled>;
