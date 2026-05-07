import type { Subscription } from '../../api/commerce';

export const activeSubscription: Subscription = {
  id: 'd3000001-0000-0000-0000-000000000001',
  actorId: '11111111-1111-1111-1111-111111111111',  // testUser1 from identity-access
  planId: 'b1000001-0000-0000-0000-000000000001',
  offerId: null,
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelledAt: null,
  trialEndsAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const cancelledSubscription: Subscription = {
  id: 'd3000002-0000-0000-0000-000000000002',
  actorId: '22222222-2222-2222-2222-222222222222',  // testUser2 from identity-access
  planId: 'b1000002-0000-0000-0000-000000000002',
  offerId: null,
  status: 'cancelled',
  currentPeriodStart: '2023-12-01T00:00:00Z',
  currentPeriodEnd: '2024-01-01T00:00:00Z',
  cancelledAt: '2023-12-15T10:00:00Z',
  trialEndsAt: null,
  createdAt: '2023-12-01T00:00:00Z',
  updatedAt: '2023-12-15T10:00:00Z',
};

export const agentSubscription: Subscription = {
  id: 'd3000003-0000-0000-0000-000000000003',
  actorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  // testAgent1 from identity-access (Agent actor)
  planId: 'b1000001-0000-0000-0000-000000000001',
  offerId: 'c2000001-0000-0000-0000-000000000001',
  status: 'trialing',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelledAt: null,
  trialEndsAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
