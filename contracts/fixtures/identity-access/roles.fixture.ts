import type { Role, Permission } from '../../api/identity-access';

/**
 * Test fixtures for Role entities.
 * These are deterministic test data conforming to the Role schema.
 */

export const ownerRole: Role = {
  id: '00000001-0000-0000-0000-000000000001',
  name: 'Owner',
  scope: 'community',
  isBuiltIn: true,
  description: 'Full control over the community with all permissions',
};

export const adminRole: Role = {
  id: '00000002-0000-0000-0000-000000000002',
  name: 'Admin',
  scope: 'community',
  isBuiltIn: true,
  description: 'Administrative access with most permissions except ownership transfer',
};

export const moderatorRole: Role = {
  id: '00000003-0000-0000-0000-000000000003',
  name: 'Moderator',
  scope: 'community',
  isBuiltIn: true,
  description: 'Can moderate content and manage members',
};

export const memberRole: Role = {
  id: '00000004-0000-0000-0000-000000000004',
  name: 'Member',
  scope: 'community',
  isBuiltIn: true,
  description: 'Standard community member with basic access',
};

/**
 * System-level admin role for platform administration.
 */
export const systemAdminRole: Role = {
  id: '00000005-0000-0000-0000-000000000005',
  name: 'System Admin',
  scope: 'system',
  isBuiltIn: true,
  description: 'Platform-wide administrative access',
};

/**
 * A custom (non-built-in) role for testing custom role scenarios.
 */
export const customRole: Role = {
  id: '00000006-0000-0000-0000-000000000006',
  name: 'Content Creator',
  scope: 'community',
  isBuiltIn: false,
  description: 'Custom role for users who create content',
};

/**
 * Sample permissions for testing permission checks.
 */
export const permissions: Permission[] = [
  { key: 'community.manage', description: 'Manage community settings' },
  { key: 'community.delete', description: 'Delete the community' },
  { key: 'members.invite', description: 'Invite new members' },
  { key: 'members.remove', description: 'Remove members from community' },
  { key: 'members.ban', description: 'Ban members from community' },
  { key: 'content.create', description: 'Create new content' },
  { key: 'content.edit', description: 'Edit existing content' },
  { key: 'content.delete', description: 'Delete content' },
  { key: 'content.moderate', description: 'Moderate user content' },
  { key: 'channels.create', description: 'Create new channels' },
  { key: 'channels.manage', description: 'Manage channel settings' },
  { key: 'spaces.create', description: 'Create new spaces' },
  { key: 'spaces.manage', description: 'Manage space settings' },
];

/**
 * Permission sets for each role (for testing permission checks).
 */
export const rolePermissions: Record<string, string[]> = {
  [ownerRole.id]: permissions.map(p => p.key),
  [adminRole.id]: permissions.filter(p => p.key !== 'community.delete').map(p => p.key),
  [moderatorRole.id]: [
    'members.remove',
    'members.ban',
    'content.moderate',
    'content.delete',
  ],
  [memberRole.id]: [
    'content.create',
    'content.edit',
  ],
};
