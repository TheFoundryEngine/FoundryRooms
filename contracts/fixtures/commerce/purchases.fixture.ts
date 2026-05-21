import type { Purchase } from '../../api/commerce';

export const completedPurchase: Purchase = {
  id: 'e4000001-0000-0000-0000-000000000001',
  purchaserUserId: '11111111-1111-1111-1111-111111111111',  // human user who paid
  granteeActorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  // agent who gets access
  planId: 'b1000001-0000-0000-0000-000000000001',
  offerId: null,
  idempotencyKey: 'usr-11111111-plan-b1000001-1704067200000',
  priceAmount: 1999,
  currency: 'USD',
  status: 'completed',
  processedAt: '2024-01-01T00:05:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:05:00Z',
};

export const selfPurchase: Purchase = {
  id: 'e4000002-0000-0000-0000-000000000002',
  purchaserUserId: '22222222-2222-2222-2222-222222222222',  // user purchases for themselves
  granteeActorId: '22222222-2222-2222-2222-222222222222',  // same actor gets access
  planId: 'b1000002-0000-0000-0000-000000000002',
  offerId: null,
  idempotencyKey: 'usr-22222222-plan-b1000002-1704153600000',
  priceAmount: 499,
  currency: 'USD',
  status: 'completed',
  processedAt: '2024-01-02T00:05:00Z',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:05:00Z',
};
