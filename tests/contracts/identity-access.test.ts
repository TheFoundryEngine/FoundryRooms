import { describe, it, expect } from 'vitest';
import {
  IdentityAccessApi,
  IdentityAccessEvents,
  IdentityAccessFixtures,
  IdentityAccessMocks,
} from '@foundry/contracts';

describe('Identity Access API Contracts', () => {
  describe('User schema', () => {
    it('should validate a valid user', () => {
      const result = IdentityAccessApi.User.safeParse(IdentityAccessFixtures.testUser1);
      expect(result.success).toBe(true);
    });

    it('should reject invalid user data', () => {
      const result = IdentityAccessApi.User.safeParse({
        id: 'not-a-uuid',
        type: 'user',
        displayName: '',
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Agent schema', () => {
    it('should validate a valid agent', () => {
      const result = IdentityAccessApi.Agent.safeParse(IdentityAccessFixtures.testAgent1);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateUserRequest schema', () => {
    it('should validate a valid create user request', () => {
      const result = IdentityAccessApi.CreateUserRequest.safeParse({
        email: 'test@example.com',
        password: 'securePassword123',
        displayName: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = IdentityAccessApi.CreateUserRequest.safeParse({
        email: 'test@example.com',
        password: 'short',
        displayName: 'Test User',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Identity Access Event Contracts', () => {
  describe('UserRegisteredEvent', () => {
    it('should validate a valid user registered event', () => {
      const event = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'identity.user.registered',
        occurredAt: '2024-01-15T10:30:00Z',
        aggregateId: '550e8400-e29b-41d4-a716-446655440000',
        aggregateType: 'user',
        actorId: null,
        payload: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'alice@example.com',
          displayName: 'Alice Johnson',
          emailVerified: false,
        },
      };
      const result = IdentityAccessEvents.UserRegisteredEvent.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('RoleAssignedEvent', () => {
    it('should validate a valid role assigned event', () => {
      const event = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        type: 'identity.role.assigned',
        occurredAt: '2024-01-15T10:30:00Z',
        aggregateId: '550e8400-e29b-41d4-a716-446655440004',
        aggregateType: 'role',
        actorId: '550e8400-e29b-41d4-a716-446655440000',
        payload: {
          actorId: '550e8400-e29b-41d4-a716-446655440001',
          actorType: 'user',
          roleId: '550e8400-e29b-41d4-a716-446655440004',
          roleName: 'Admin',
          scopeType: 'system',
          scopeId: null,
        },
      };
      const result = IdentityAccessEvents.RoleAssignedEvent.safeParse(event);
      expect(result.success).toBe(true);
    });
  });
});

describe('Identity Access Fixtures', () => {
  it('should export test users', () => {
    expect(IdentityAccessFixtures.testUser1).toBeDefined();
    expect(IdentityAccessFixtures.testUser1.type).toBe('user');
    expect(IdentityAccessFixtures.testUser2).toBeDefined();
    expect(IdentityAccessFixtures.inactiveUser).toBeDefined();
  });

  it('should export test agents', () => {
    expect(IdentityAccessFixtures.testAgent1).toBeDefined();
    expect(IdentityAccessFixtures.testAgent1.type).toBe('agent');
    expect(IdentityAccessFixtures.testAgent2).toBeDefined();
    expect(IdentityAccessFixtures.inactiveAgent).toBeDefined();
  });

  it('should export test roles', () => {
    expect(IdentityAccessFixtures.adminRole).toBeDefined();
    expect(IdentityAccessFixtures.memberRole).toBeDefined();
    expect(IdentityAccessFixtures.moderatorRole).toBeDefined();
  });

  it('should export permissions', () => {
    expect(IdentityAccessFixtures.permissions).toBeDefined();
    expect(Array.isArray(IdentityAccessFixtures.permissions)).toBe(true);
    expect(IdentityAccessFixtures.permissions.length).toBeGreaterThan(0);
  });
});

describe('Identity Access Mocks', () => {
  describe('MockPermissionChecker', () => {
    it('should allow admin user all permissions by default', () => {
      const checker = new IdentityAccessMocks.MockPermissionChecker();
      expect(checker.canActor(IdentityAccessFixtures.testUser1.id, 'community.manage')).toBe(true);
    });

    it('should deny inactive users all permissions', () => {
      const checker = new IdentityAccessMocks.MockPermissionChecker();
      expect(checker.canActor(IdentityAccessFixtures.inactiveUser.id, 'community.manage')).toBe(false);
    });

    it('should allow granting permissions', () => {
      const checker = new IdentityAccessMocks.MockPermissionChecker();
      const newActorId = '99999999-9999-9999-9999-999999999999';
      checker.grantPermission(newActorId, 'content.create');
      expect(checker.canActor(newActorId, 'content.create')).toBe(true);
    });

    it('should allow revoking permissions', () => {
      const checker = new IdentityAccessMocks.MockPermissionChecker();
      checker.revokePermission(IdentityAccessFixtures.testUser1.id, 'community.manage');
      expect(checker.canActor(IdentityAccessFixtures.testUser1.id, 'community.manage')).toBe(false);
    });

    it('should reset to default state', () => {
      // Create a fresh checker and grant a custom permission to a new actor
      const checker = new IdentityAccessMocks.MockPermissionChecker();
      const customActorId = '88888888-8888-8888-8888-888888888888';
      checker.grantPermission(customActorId, 'custom.permission');
      expect(checker.canActor(customActorId, 'custom.permission')).toBe(true);
      // Reset and verify custom permission is gone
      checker.reset();
      expect(checker.canActor(customActorId, 'custom.permission')).toBe(false);
    });
  });

  describe('MockActorLookup', () => {
    it('should find test users by ID', () => {
      const lookup = new IdentityAccessMocks.MockActorLookup();
      const user = lookup.findById(IdentityAccessFixtures.testUser1.id);
      expect(user).toBeDefined();
      expect(user?.id).toBe(IdentityAccessFixtures.testUser1.id);
    });

    it('should find test agents by ID', () => {
      const lookup = new IdentityAccessMocks.MockActorLookup();
      const agent = lookup.findById(IdentityAccessFixtures.testAgent1.id);
      expect(agent).toBeDefined();
      expect(agent?.id).toBe(IdentityAccessFixtures.testAgent1.id);
    });

    it('should return null for unknown ID', () => {
      const lookup = new IdentityAccessMocks.MockActorLookup();
      const result = lookup.findById('unknown-id');
      expect(result).toBeNull();
    });

    it('should find users by email', () => {
      const lookup = new IdentityAccessMocks.MockActorLookup();
      const user = lookup.findByEmail(IdentityAccessFixtures.testUser1.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(IdentityAccessFixtures.testUser1.email);
    });
  });
});
