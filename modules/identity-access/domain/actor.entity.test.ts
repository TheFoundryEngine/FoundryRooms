import { describe, it, expect } from 'vitest';
import {
  ActorId,
  ActorType,
  createActorId,
  generateActorId,
  Actor,
  ActorProps,
} from './actor.entity';

// Concrete implementation for testing the abstract Actor class
class TestActor extends Actor {
  constructor(props: ActorProps) {
    super(props);
  }

  static create(props: {
    id?: ActorId;
    displayName: string;
    avatarUrl?: string | null;
    isActive?: boolean;
  }): TestActor {
    const now = new Date();
    return new TestActor({
      id: props.id ?? generateActorId(),
      type: 'user' as ActorType,
      displayName: props.displayName,
      avatarUrl: props.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive ?? true,
    });
  }
}

describe('ActorId Value Object', () => {
  describe('createActorId', () => {
    it('should create an ActorId from a valid UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const actorId = createActorId(uuid);
      expect(actorId).toBe(uuid);
    });

    it('should accept uppercase UUIDs', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const actorId = createActorId(uuid);
      expect(actorId).toBe(uuid);
    });

    it('should throw for invalid UUID format', () => {
      expect(() => createActorId('not-a-uuid')).toThrow('Invalid ActorId');
      expect(() => createActorId('')).toThrow('Invalid ActorId');
      expect(() => createActorId('550e8400-e29b-41d4-a716')).toThrow(
        'Invalid ActorId'
      );
    });
  });

  describe('generateActorId', () => {
    it('should generate a valid UUID', () => {
      const id = generateActorId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const id1 = generateActorId();
      const id2 = generateActorId();
      expect(id1).not.toBe(id2);
    });
  });
});

describe('Actor Base Class', () => {
  describe('construction', () => {
    it('should create an actor with valid properties', () => {
      const actor = TestActor.create({
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(actor.displayName).toBe('Test User');
      expect(actor.avatarUrl).toBe('https://example.com/avatar.png');
      expect(actor.type).toBe('user');
      expect(actor.isActive).toBe(true);
      expect(actor.createdAt).toBeInstanceOf(Date);
      expect(actor.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided ActorId', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const actor = TestActor.create({ id, displayName: 'Test' });
      expect(actor.id).toBe(id);
    });

    it('should accept null avatarUrl', () => {
      const actor = TestActor.create({ displayName: 'Test', avatarUrl: null });
      expect(actor.avatarUrl).toBeNull();
    });
  });

  describe('displayName validation', () => {
    it('should throw for empty display name', () => {
      expect(() => TestActor.create({ displayName: '' })).toThrow(
        'Display name cannot be empty'
      );
    });

    it('should throw for whitespace-only display name', () => {
      expect(() => TestActor.create({ displayName: '   ' })).toThrow(
        'Display name cannot be empty'
      );
    });

    it('should throw for display name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => TestActor.create({ displayName: longName })).toThrow(
        'Display name cannot exceed 100 characters'
      );
    });

    it('should accept display name of exactly 100 characters', () => {
      const name = 'a'.repeat(100);
      const actor = TestActor.create({ displayName: name });
      expect(actor.displayName).toBe(name);
    });
  });

  describe('updateDisplayName', () => {
    it('should update display name and touch updatedAt', () => {
      const actor = TestActor.create({ displayName: 'Old Name' });
      const originalUpdatedAt = actor.updatedAt;

      // Small delay to ensure time difference
      actor.updateDisplayName('New Name');

      expect(actor.displayName).toBe('New Name');
      expect(actor.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });

    it('should validate new display name', () => {
      const actor = TestActor.create({ displayName: 'Test' });
      expect(() => actor.updateDisplayName('')).toThrow(
        'Display name cannot be empty'
      );
    });
  });

  describe('updateAvatarUrl', () => {
    it('should update avatar URL', () => {
      const actor = TestActor.create({ displayName: 'Test' });
      actor.updateAvatarUrl('https://example.com/new-avatar.png');
      expect(actor.avatarUrl).toBe('https://example.com/new-avatar.png');
    });

    it('should accept null to remove avatar', () => {
      const actor = TestActor.create({
        displayName: 'Test',
        avatarUrl: 'https://example.com/avatar.png',
      });
      actor.updateAvatarUrl(null);
      expect(actor.avatarUrl).toBeNull();
    });

    it('should throw for invalid URL', () => {
      const actor = TestActor.create({ displayName: 'Test' });
      expect(() => actor.updateAvatarUrl('not-a-url')).toThrow(
        'Invalid avatar URL'
      );
    });
  });

  describe('activation state', () => {
    it('should deactivate an active actor', () => {
      const actor = TestActor.create({ displayName: 'Test', isActive: true });
      actor.deactivate();
      expect(actor.isActive).toBe(false);
    });

    it('should throw when deactivating an inactive actor', () => {
      const actor = TestActor.create({ displayName: 'Test', isActive: false });
      expect(() => actor.deactivate()).toThrow('Actor is already inactive');
    });

    it('should activate an inactive actor', () => {
      const actor = TestActor.create({ displayName: 'Test', isActive: false });
      actor.activate();
      expect(actor.isActive).toBe(true);
    });

    it('should throw when activating an active actor', () => {
      const actor = TestActor.create({ displayName: 'Test', isActive: true });
      expect(() => actor.activate()).toThrow('Actor is already active');
    });
  });

  describe('toJSON', () => {
    it('should serialize actor to JSON-compatible object', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const actor = TestActor.create({
        id,
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const json = actor.toJSON();

      expect(json).toEqual({
        id,
        type: 'user',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isActive: true,
      });
    });
  });
});
