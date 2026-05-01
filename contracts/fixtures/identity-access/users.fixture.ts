import type { User } from '../../api/identity-access';

/**
 * Test fixtures for User entities.
 * These are deterministic test data conforming to the User schema.
 */

export const testUser1: User = {
  id: '11111111-1111-1111-1111-111111111111',
  type: 'user',
  displayName: 'Alice Johnson',
  email: 'alice@example.com',
  emailVerified: true,
  avatarUrl: 'https://example.com/avatars/alice.png',
  lastLoginAt: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  isActive: true,
};

export const testUser2: User = {
  id: '22222222-2222-2222-2222-222222222222',
  type: 'user',
  displayName: 'Bob Smith',
  email: 'bob@example.com',
  emailVerified: false,
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: '2024-01-05T12:00:00Z',
  updatedAt: '2024-01-05T12:00:00Z',
  isActive: true,
};

/**
 * An inactive user for testing deactivation scenarios.
 */
export const inactiveUser: User = {
  id: '33333333-3333-3333-3333-333333333333',
  type: 'user',
  displayName: 'Inactive User',
  email: 'inactive@example.com',
  emailVerified: true,
  avatarUrl: null,
  lastLoginAt: '2023-06-01T00:00:00Z',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  isActive: false,
};
