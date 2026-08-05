import { describe, it, expect, vi } from 'vitest';
import {
  createEntitlementSyncHandler,
  entitlementSyncSchema,
} from './entitlement-sync.handler';

const validPayload = {
  entitlementId: '22222222-2222-2222-2222-222222222222',
  actorId: '11111111-1111-1111-1111-111111111111',
  type: 'paid_membership' as const,
  source: 'subscription' as const,
};

describe('entitlement-sync handler', () => {
  it('validates and processes a valid payload', async () => {
    const service = { syncEntitlement: vi.fn().mockResolvedValue({ synced: true }) };
    const handler = createEntitlementSyncHandler({ service });
    const result = await handler.handle(validPayload, { logger: console as never });
    expect(result).toEqual({ synced: true });
    expect(service.syncEntitlement).toHaveBeenCalledWith(validPayload);
  });

  it('rejects an invalid entitlement type', () => {
    expect(() =>
      entitlementSyncSchema.parse({ ...validPayload, type: 'bogus' as never }),
    ).toThrow();
  });

  it('delegates to the application service, not adapters', async () => {
    const service = { syncEntitlement: vi.fn().mockResolvedValue({ synced: true }) };
    const handler = createEntitlementSyncHandler({ service });
    await handler.handle(validPayload, { logger: console as never });
    expect(service.syncEntitlement).toHaveBeenCalledTimes(1);
  });
});
