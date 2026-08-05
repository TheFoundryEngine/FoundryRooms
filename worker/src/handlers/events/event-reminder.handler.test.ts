import { describe, it, expect, vi } from 'vitest';
import {
  createEventReminderHandler,
  eventReminderSchema,
} from './event-reminder.handler';

const validPayload = {
  reminderId: '33333333-3333-3333-3333-333333333333',
  eventId: '44444444-4444-4444-4444-444444444444',
  targetActorId: '11111111-1111-1111-1111-111111111111',
  fireAt: '2025-01-01T00:00:00.000Z',
};

describe('event-reminder handler', () => {
  it('validates and processes a valid payload', async () => {
    const service = { sendReminder: vi.fn().mockResolvedValue({ sent: true }) };
    const handler = createEventReminderHandler({ service });
    const result = await handler.handle(validPayload, { logger: console as never });
    expect(result).toEqual({ sent: true });
    expect(service.sendReminder).toHaveBeenCalledWith(validPayload);
  });

  it('rejects a non-ISO datetime for fireAt', () => {
    expect(() =>
      eventReminderSchema.parse({ ...validPayload, fireAt: 'tomorrow' }),
    ).toThrow();
  });

  it('delegates to the application service, not adapters', async () => {
    const service = { sendReminder: vi.fn().mockResolvedValue({ sent: true }) };
    const handler = createEventReminderHandler({ service });
    await handler.handle(validPayload, { logger: console as never });
    expect(service.sendReminder).toHaveBeenCalledTimes(1);
  });
});
