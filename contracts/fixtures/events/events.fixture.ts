import type { Event } from '../../api/events';

// communityId shared across event fixtures
const communityId = 'f0000001-0000-0000-0000-000000000001';
// host actor (user) from identity-access fixtures
const hostActorId = '11111111-1111-1111-1111-111111111111';

export const testEventPublic: Event = {
  id: 'e1000001-0000-0000-0000-000000000001',
  communityId,
  hostActorId,
  title: 'Weekly Community Meetup',
  description: 'Join us for our weekly open community session.',
  scheduledAt: '2026-06-01T18:00:00Z',
  durationMinutes: 60,
  timezone: 'America/Chicago',
  visibility: 'public',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

export const testEventMembersOnly: Event = {
  id: 'e1000002-0000-0000-0000-000000000002',
  communityId,
  hostActorId,
  title: 'Members-Only Q&A',
  description: null,
  scheduledAt: '2026-06-08T18:00:00Z',
  durationMinutes: 90,
  timezone: 'America/Chicago',
  visibility: 'members_only',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

export const testEventEntitlementGated: Event = {
  id: 'e1000003-0000-0000-0000-000000000003',
  communityId,
  hostActorId,
  title: 'Pro Members Workshop',
  description: 'Exclusive workshop for Pro plan subscribers.',
  scheduledAt: '2026-06-15T18:00:00Z',
  durationMinutes: 120,
  timezone: 'America/Chicago',
  visibility: 'entitlement_gated',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};
