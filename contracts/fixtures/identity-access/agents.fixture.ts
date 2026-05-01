import type { Agent } from '../../api/identity-access';

/**
 * Test fixtures for Agent entities.
 * These are deterministic test data conforming to the Agent schema.
 */

export const testAgent1: Agent = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  type: 'agent',
  displayName: 'Community Bot',
  description: 'Automated bot for community management tasks',
  avatarUrl: 'https://example.com/avatars/bot.png',
  ownerActorId: '11111111-1111-1111-1111-111111111111', // Owned by testUser1
  metadata: {
    version: '1.0.0',
    capabilities: ['moderation', 'notifications'],
  },
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  isActive: true,
};

export const testAgent2: Agent = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  type: 'agent',
  displayName: 'Analytics Agent',
  description: 'Agent for collecting and reporting analytics',
  avatarUrl: null,
  ownerActorId: null, // System-level agent with no owner
  metadata: {
    version: '2.1.0',
    dataRetentionDays: 90,
  },
  createdAt: '2024-01-03T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
  isActive: true,
};

/**
 * An inactive agent for testing deactivation scenarios.
 */
export const inactiveAgent: Agent = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  type: 'agent',
  displayName: 'Deprecated Bot',
  description: 'An old bot that has been deactivated',
  avatarUrl: null,
  ownerActorId: '22222222-2222-2222-2222-222222222222', // Owned by testUser2
  metadata: undefined,
  createdAt: '2023-06-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: false,
};
