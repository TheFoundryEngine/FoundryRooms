/**
 * Event Reminder handler (events context).
 *
 * Sends a reminder for an upcoming event to a target actor. Delegates to
 * the EventReminderService port. Idempotent: re-firing the same reminder
 * is safe (the service marks it sent and dedups by reminderId).
 */
import { z } from 'zod';
import type { JobHandler } from '../../runtime/handler';

export const eventReminderSchema = z.object({
  reminderId: z.string().uuid(),
  eventId: z.string().uuid(),
  targetActorId: z.string().uuid(),
  fireAt: z.string().datetime(),
});

export type EventReminderPayload = z.infer<typeof eventReminderSchema>;

export interface EventReminderService {
  sendReminder(input: EventReminderPayload): Promise<{ sent: boolean }>;
}

export interface EventReminderHandlerDeps {
  service: EventReminderService;
}

export function createEventReminderHandler(
  deps: EventReminderHandlerDeps,
): JobHandler<EventReminderPayload, { sent: boolean }> {
  return {
    name: 'events.event-reminder',
    schema: eventReminderSchema,
    async handle(payload) {
      return deps.service.sendReminder(payload);
    },
  };
}
