import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const EventId = z.string().uuid();
const ActorId = z.string().uuid();

export const AttendanceMarked = createEventSchema(
  'events.attendance.marked',
  'attendance',
  {
    eventId: EventId,
    actorId: ActorId,
    markedByActorId: ActorId,
    markedAt: z.string().datetime(),
  },
);
export type AttendanceMarked = InferEvent<typeof AttendanceMarked>;
