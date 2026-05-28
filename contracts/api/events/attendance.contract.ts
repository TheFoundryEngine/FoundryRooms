import { z } from 'zod';

export const Attendance = z.object({
  eventId: z.string().uuid(),
  actorId: z.string().uuid(),
  markedAt: z.string().datetime(),
  markedByActorId: z.string().uuid(),
});
export type Attendance = z.infer<typeof Attendance>;

export const MarkAttendedRequest = z.object({
  actorId: z.string().uuid(),
});
export type MarkAttendedRequest = z.infer<typeof MarkAttendedRequest>;
