import { describe, it, expect, vi } from 'vitest';
import {
  createInviteExpirationHandler,
  inviteExpirationSchema,
} from './invite-expiration.handler';

const validPayload = {
  inviteId: '55555555-5555-5555-5555-555555555555',
  email: 'invitee@example.com',
  expiresAt: '2025-01-01T00:00:00.000Z',
};

describe('invite-expiration handler', () => {
  it('validates and processes a valid payload', async () => {
    const service = { expireInvite: vi.fn().mockResolvedValue({ expired: true }) };
    const handler = createInviteExpirationHandler({ service });
    const result = await handler.handle(validPayload, { logger: console as never });
    expect(result).toEqual({ expired: true });
    expect(service.expireInvite).toHaveBeenCalledWith(validPayload);
  });

  it('rejects an invalid inviteId', () => {
    expect(() =>
      inviteExpirationSchema.parse({ ...validPayload, inviteId: 'not-a-uuid' }),
    ).toThrow();
  });

  it('delegates to the application service, not adapters', async () => {
    const service = { expireInvite: vi.fn().mockResolvedValue({ expired: true }) };
    const handler = createInviteExpirationHandler({ service });
    await handler.handle(validPayload, { logger: console as never });
    expect(service.expireInvite).toHaveBeenCalledTimes(1);
  });
});
