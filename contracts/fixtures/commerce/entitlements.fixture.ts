import type { Entitlement } from '../../api/commerce';

export const paidMembershipEntitlement: Entitlement = {
  id: 'e5000001-0000-0000-0000-000000000001',
  actorId: '11111111-1111-1111-1111-111111111111',
  type: 'paid_membership',
  source: 'purchase',
  scopeType: null,
  scopeId: null,
  expiresAt: '2025-01-01T00:00:00Z',
  grantedAt: '2024-01-01T00:05:00Z',
  grantedByActorId: null,
};

export const agentCapabilityEntitlement: Entitlement = {
  id: 'e5000002-0000-0000-0000-000000000002',
  actorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  // Agent actor
  type: 'agent_capability',
  source: 'system',
  scopeType: 'capability',
  scopeId: null,
  expiresAt: null,
  grantedAt: '2024-01-02T00:00:00Z',
  grantedByActorId: null,
};

export const expiredEntitlement: Entitlement = {
  id: 'e5000003-0000-0000-0000-000000000003',
  actorId: '22222222-2222-2222-2222-222222222222',
  type: 'paid_membership',
  source: 'purchase',
  scopeType: null,
  scopeId: null,
  expiresAt: '2023-12-31T23:59:59Z',  // in the past
  grantedAt: '2023-01-01T00:00:00Z',
  grantedByActorId: '11111111-1111-1111-1111-111111111111',
};

export const channelAccessEntitlement: Entitlement = {
  id: 'e5000004-0000-0000-0000-000000000004',
  actorId: '11111111-1111-1111-1111-111111111111',
  type: 'gated_channel_access',
  source: 'subscription',
  scopeType: 'channel',
  scopeId: 'c0000001-0000-0000-0000-000000000001',
  expiresAt: '2025-01-01T00:00:00Z',
  grantedAt: '2024-01-01T00:05:00Z',
  grantedByActorId: null,
};
