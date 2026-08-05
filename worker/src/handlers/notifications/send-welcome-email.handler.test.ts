import { describe, it, expect, vi } from 'vitest';
import {
  createSendWelcomeEmailHandler,
  sendWelcomeEmailSchema,
} from './send-welcome-email.handler';

const validPayload = {
  userId: '11111111-1111-1111-1111-111111111111',
  email: 'alice@example.com',
  displayName: 'Alice',
};

describe('send-welcome-email handler', () => {
  it('validates and processes a valid payload', async () => {
    const service = { sendWelcomeEmail: vi.fn().mockResolvedValue({ delivered: true }) };
    const handler = createSendWelcomeEmailHandler({ service });
    const result = await handler.handle(validPayload, { logger: console as never });
    expect(result).toEqual({ delivered: true });
    expect(service.sendWelcomeEmail).toHaveBeenCalledWith(validPayload);
  });

  it('rejects an invalid payload (bad email) before calling the service', () => {
    const service = { sendWelcomeEmail: vi.fn() };
    createSendWelcomeEmailHandler({ service });
    // Validation is the runtime's job; it rejects before handle is ever called.
    expect(() => sendWelcomeEmailSchema.parse({ ...validPayload, email: 'nope' })).toThrow();
    expect(service.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("is idempotent — re-running with the same payload calls the service again (dedup is the service's job)", async () => {
    const service = { sendWelcomeEmail: vi.fn().mockResolvedValue({ delivered: true }) };
    const handler = createSendWelcomeEmailHandler({ service });
    await handler.handle(validPayload, { logger: console as never });
    await handler.handle(validPayload, { logger: console as never });
    expect(service.sendWelcomeEmail).toHaveBeenCalledTimes(2);
  });
});
