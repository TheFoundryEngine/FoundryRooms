import type { Space } from '../../api/community-structure';

/**
 * Test fixtures for Space entities.
 * These are deterministic test data conforming to the Space schema.
 */

export const testSpace1: Space = {
  id: 'a0000001-0000-0000-0000-000000000001',
  communityId: 'c0000001-0000-0000-0000-000000000001', // belongs to testCommunity1
  name: 'General',
  slug: 'general',
  description: 'General discussion space for all community members',
  visibility: 'public',
  iconEmoji: null,
  order: 0,
  createdAt: '2024-01-01T00:00:00Z',
};

export const testSpace2: Space = {
  id: 'a0000002-0000-0000-0000-000000000002',
  communityId: 'c0000001-0000-0000-0000-000000000001', // belongs to testCommunity1
  name: 'Backend Development',
  slug: 'backend-dev',
  description: 'Space for backend development discussions and resources',
  visibility: 'members',
  iconEmoji: null,
  order: 1,
  createdAt: '2024-01-02T00:00:00Z',
};

/**
 * A restricted space for testing access control.
 */
export const restrictedSpace: Space = {
  id: 'a0000003-0000-0000-0000-000000000003',
  communityId: 'c0000002-0000-0000-0000-000000000002', // belongs to testCommunity2
  name: 'Leadership',
  slug: 'leadership',
  description: 'Restricted space for project leadership only',
  visibility: 'restricted',
  iconEmoji: null,
  order: 0,
  createdAt: '2024-01-10T00:00:00Z',
};
