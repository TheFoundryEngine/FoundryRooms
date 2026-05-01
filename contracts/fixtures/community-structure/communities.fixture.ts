import type { Community } from '../../api/community-structure';

/**
 * Test fixtures for Community entities.
 * These are deterministic test data conforming to the Community schema.
 */

export const testCommunity1: Community = {
  id: 'c0000001-0000-0000-0000-000000000001',
  name: 'Developers Hub',
  slug: 'developers-hub',
  description: 'A community for software developers to collaborate and share knowledge',
  visibility: 'public',
  iconUrl: 'https://example.com/icons/dev-hub.png',
  settings: {
    allowGuestAccess: true,
    defaultChannelType: 'discussion',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

export const testCommunity2: Community = {
  id: 'c0000002-0000-0000-0000-000000000002',
  name: 'Private Project Team',
  slug: 'private-project',
  description: 'A private community for project team members only',
  visibility: 'private',
  iconUrl: null,
  settings: {
    requireApproval: true,
    maxMembers: 50,
  },
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
};

/**
 * A minimal community with only required fields.
 */
export const minimalCommunity: Community = {
  id: 'c0000003-0000-0000-0000-000000000003',
  name: 'Minimal Community',
  slug: 'minimal',
  description: null,
  visibility: 'public',
  iconUrl: null,
  createdAt: '2024-01-20T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
};
