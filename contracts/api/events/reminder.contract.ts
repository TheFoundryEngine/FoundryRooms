import { z } from 'zod';

export const ReminderStatus = z.enum(['scheduled', 'sent', 'cancelled', 'failed']);
export type ReminderStatus = z.infer<typeof ReminderStatus>;

export const Reminder = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  targetActorId: z.string().uuid(),
  fireAt: z.string().datetime(),
  status: ReminderStatus,
});
export type Reminder = z.infer<typeof Reminder>;

export const ReminderSummary = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  fireAt: z.string().datetime(),
  status: ReminderStatus,
});
export type ReminderSummary = z.infer<typeof ReminderSummary>;
