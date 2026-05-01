import type { Channel } from '../../api/community-structure';

/**
 * Test fixtures for Channel entities.
 * These are deterministic test data conforming to the Channel schema.
 */

export const testChannel1: Channel = {
  id: 'b0000001-0000-0000-0000-000000000001',
  spaceId: 'a0000001-0000-0000-0000-000000000001', // belongs to testSpace1
  name: 'welcome',
  type: 'discussion',
  description: 'Welcome channel for new members to introduce themselves',
  visibility: 'public',
  order: 0,
  settings: {
    slowMode: false,
    allowThreads: true,
  },
  createdAt: '2024-01-01T00:00:00Z',
};

export const testChannel2: Channel = {
  id: 'b0000002-0000-0000-0000-000000000002',
  spaceId: 'a0000001-0000-0000-0000-000000000001', // belongs to testSpace1
  name: 'announcements',
  type: 'announcements',
  description: 'Official announcements from community leadership',
  visibility: 'public',
  order: 1,
  settings: {
    allowMemberPosts: false,
    notifyAll: true,
  },
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * An events channel for testing event-specific functionality.
 */
export const eventsChannel: Channel = {
  id: 'b0000003-0000-0000-0000-000000000003',
  spaceId: 'a0000002-0000-0000-0000-000000000002', // belongs to testSpace2
  name: 'meetups',
  type: 'events',
  description: 'Backend developer meetups and events',
  visibility: 'members',
  order: 0,
  settings: {
    enableRSVP: true,
    maxAttendees: 100,
  },
  createdAt: '2024-01-02T00:00:00Z',
};

/**
 * A resources channel for testing resource sharing.
 */
export const resourcesChannel: Channel = {
  id: 'b0000004-0000-0000-0000-000000000004',
  spaceId: 'a0000002-0000-0000-0000-000000000002', // belongs to testSpace2
  name: 'tutorials',
  type: 'resources',
  description: 'Backend development tutorials and learning resources',
  visibility: 'members',
  order: 1,
  createdAt: '2024-01-02T00:00:00Z',
};

/**
 * A restricted channel for testing access control.
 */
export const restrictedChannel: Channel = {
  id: 'b0000005-0000-0000-0000-000000000005',
  spaceId: 'a0000003-0000-0000-0000-000000000003', // belongs to restrictedSpace
  name: 'strategy',
  type: 'discussion',
  description: 'Strategic discussions for leadership team',
  visibility: 'restricted',
  order: 0,
  createdAt: '2024-01-10T00:00:00Z',
};
