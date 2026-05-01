import type { ActorId } from '../../api/identity-access';
import {
  testUser1,
  testUser2,
  inactiveUser,
  testAgent1,
  testAgent2,
  inactiveAgent,
  permissions,
} from '../../fixtures/identity-access';

/**
 * Configuration options for MockPermissionChecker.
 */
export interface PermissionCheckerConfig {
  /**
   * Map of actorId to array of permission keys they have.
   * If not specified, defaults are used.
   */
  actorPermissions?: Record<string, string[]>;

  /**
   * Map of actorId to scoped permissions.
   * Key format: "scopeType:scopeId" -> array of permission keys.
   */
  scopedPermissions?: Record<string, Record<string, string[]>>;

  /**
   * If true, inactive actors are denied all permissions.
   * Defaults to true.
   */
  denyInactiveActors?: boolean;
}

/**
 * Scope object for permission checks.
 */
export interface PermissionScope {
  type: string;
  id: string;
}

/**
 * All permission keys from fixtures for convenience.
 */
const ALL_PERMISSION_KEYS = permissions.map((p) => p.key);

/**
 * Default permissions for test fixtures.
 * - testUser1 (Alice): All permissions (admin-like)
 * - testUser2 (Bob): Basic member permissions
 * - testAgent1: Moderation permissions (owned by testUser1)
 * - testAgent2: Read-only analytics permissions
 * - Inactive actors: No permissions
 */
const DEFAULT_ACTOR_PERMISSIONS: Record<string, string[]> = {
  [testUser1.id]: ALL_PERMISSION_KEYS,
  [testUser2.id]: ['content.create', 'content.edit'],
  [inactiveUser.id]: [],
  [testAgent1.id]: ['content.moderate', 'content.delete', 'members.ban'],
  [testAgent2.id]: [],
  [inactiveAgent.id]: [],
};

/**
 * MockPermissionChecker provides a configurable permission checking mock
 * for testing scenarios. Teams B & C can use this to test permission-dependent
 * code without the real identity-access implementation.
 *
 * @example
 * ```typescript
 * // Use with defaults
 * const checker = new MockPermissionChecker();
 * checker.canActor(testUser1.id, 'community.manage'); // true
 *
 * // Configure custom permissions
 * const checker = new MockPermissionChecker({
 *   actorPermissions: {
 *     'custom-actor-id': ['content.create', 'content.edit'],
 *   },
 * });
 * ```
 */
export class MockPermissionChecker {
  private actorPermissions: Record<string, string[]>;
  private scopedPermissions: Record<string, Record<string, string[]>>;
  private denyInactiveActors: boolean;
  private inactiveActorIds: Set<string>;

  constructor(config: PermissionCheckerConfig = {}) {
    this.actorPermissions = {
      ...DEFAULT_ACTOR_PERMISSIONS,
      ...config.actorPermissions,
    };
    this.scopedPermissions = config.scopedPermissions ?? {};
    this.denyInactiveActors = config.denyInactiveActors ?? true;

    // Track inactive actors from fixtures
    this.inactiveActorIds = new Set([inactiveUser.id, inactiveAgent.id]);
  }

  /**
   * Check if an actor has a specific permission, optionally within a scope.
   *
   * @param actorId - The ID of the actor to check
   * @param permission - The permission key to check (e.g., 'content.create')
   * @param scope - Optional scope to check within (e.g., { type: 'community', id: '...' })
   * @returns true if the actor has the permission, false otherwise
   */
  canActor(actorId: ActorId, permission: string, scope?: PermissionScope): boolean {
    // Deny inactive actors if configured
    if (this.denyInactiveActors && this.inactiveActorIds.has(actorId)) {
      return false;
    }

    // Check scoped permissions first if scope is provided
    if (scope) {
      const scopeKey = `${scope.type}:${scope.id}`;
      const actorScopedPerms = this.scopedPermissions[actorId];
      if (actorScopedPerms && actorScopedPerms[scopeKey]) {
        return actorScopedPerms[scopeKey].includes(permission);
      }
      // Fall through to global permissions if no scoped permissions defined
    }

    // Check global permissions
    const actorPerms = this.actorPermissions[actorId];
    if (!actorPerms) {
      return false;
    }

    return actorPerms.includes(permission);
  }

  /**
   * Grant a permission to an actor.
   * Useful for setting up test scenarios.
   *
   * @param actorId - The actor to grant permission to
   * @param permission - The permission to grant
   * @param scope - Optional scope for the permission
   */
  grantPermission(actorId: ActorId, permission: string, scope?: PermissionScope): void {
    if (scope) {
      const scopeKey = `${scope.type}:${scope.id}`;
      if (!this.scopedPermissions[actorId]) {
        this.scopedPermissions[actorId] = {};
      }
      if (!this.scopedPermissions[actorId][scopeKey]) {
        this.scopedPermissions[actorId][scopeKey] = [];
      }
      if (!this.scopedPermissions[actorId][scopeKey].includes(permission)) {
        this.scopedPermissions[actorId][scopeKey].push(permission);
      }
    } else {
      if (!this.actorPermissions[actorId]) {
        this.actorPermissions[actorId] = [];
      }
      if (!this.actorPermissions[actorId].includes(permission)) {
        this.actorPermissions[actorId].push(permission);
      }
    }
  }

  /**
   * Revoke a permission from an actor.
   * Useful for setting up test scenarios.
   *
   * @param actorId - The actor to revoke permission from
   * @param permission - The permission to revoke
   * @param scope - Optional scope for the permission
   */
  revokePermission(actorId: ActorId, permission: string, scope?: PermissionScope): void {
    if (scope) {
      const scopeKey = `${scope.type}:${scope.id}`;
      const actorScopedPerms = this.scopedPermissions[actorId];
      if (actorScopedPerms && actorScopedPerms[scopeKey]) {
        const idx = actorScopedPerms[scopeKey].indexOf(permission);
        if (idx !== -1) {
          actorScopedPerms[scopeKey].splice(idx, 1);
        }
      }
    } else {
      const actorPerms = this.actorPermissions[actorId];
      if (actorPerms) {
        const idx = actorPerms.indexOf(permission);
        if (idx !== -1) {
          actorPerms.splice(idx, 1);
        }
      }
    }
  }

  /**
   * Set all permissions for an actor, replacing any existing permissions.
   *
   * @param actorId - The actor to set permissions for
   * @param permissions - Array of permission keys
   */
  setPermissions(actorId: ActorId, permissions: string[]): void {
    this.actorPermissions[actorId] = [...permissions];
  }

  /**
   * Clear all permissions for an actor.
   *
   * @param actorId - The actor to clear permissions for
   */
  clearPermissions(actorId: ActorId): void {
    this.actorPermissions[actorId] = [];
    delete this.scopedPermissions[actorId];
  }

  /**
   * Mark an actor as inactive (will be denied all permissions).
   *
   * @param actorId - The actor to mark as inactive
   */
  markInactive(actorId: ActorId): void {
    this.inactiveActorIds.add(actorId);
  }

  /**
   * Mark an actor as active.
   *
   * @param actorId - The actor to mark as active
   */
  markActive(actorId: ActorId): void {
    this.inactiveActorIds.delete(actorId);
  }

  /**
   * Reset the mock to default state.
   */
  reset(): void {
    this.actorPermissions = { ...DEFAULT_ACTOR_PERMISSIONS };
    this.scopedPermissions = {};
    this.inactiveActorIds = new Set([inactiveUser.id, inactiveAgent.id]);
  }
}
