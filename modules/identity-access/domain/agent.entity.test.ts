import { describe, it, expect } from 'vitest';
import {
  Agent,
  ApiKey,
  ApiKeyHash,
  generateApiKey,
  isValidApiKey,
  parseApiKey,
  hashApiKey,
  createApiKeyHash,
} from './agent.entity';
import { createActorId, generateActorId } from './actor.entity';

describe('ApiKey Value Object', () => {
  describe('generateApiKey', () => {
    it('should generate a valid API key with default prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^fr_live_[a-f0-9]{64}$/);
    });

    it('should generate a valid API key with custom prefix', () => {
      const key = generateApiKey('test');
      expect(key).toMatch(/^fr_test_[a-f0-9]{64}$/);
    });

    it('should generate unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });

    it('should throw for invalid prefix', () => {
      expect(() => generateApiKey('Test')).toThrow('prefix must contain only lowercase letters');
      expect(() => generateApiKey('test123')).toThrow('prefix must contain only lowercase letters');
      expect(() => generateApiKey('test-key')).toThrow('prefix must contain only lowercase letters');
    });
  });

  describe('isValidApiKey', () => {
    it('should return true for valid API keys', () => {
      const key = generateApiKey();
      expect(isValidApiKey(key)).toBe(true);
    });

    it('should return false for invalid API keys', () => {
      expect(isValidApiKey('invalid')).toBe(false);
      expect(isValidApiKey('fr_live_short')).toBe(false);
      expect(isValidApiKey('sk_live_' + 'a'.repeat(64))).toBe(false);
      expect(isValidApiKey('')).toBe(false);
    });
  });

  describe('parseApiKey', () => {
    it('should parse a valid API key', () => {
      const key = generateApiKey();
      expect(parseApiKey(key)).toBe(key);
    });

    it('should throw for invalid API key', () => {
      expect(() => parseApiKey('invalid')).toThrow('Invalid API key format');
    });
  });

  describe('hashApiKey', () => {
    it('should return a 64-character hex hash', () => {
      const key = generateApiKey();
      const hash = hashApiKey(key);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should return same hash for same key', () => {
      const key = generateApiKey();
      expect(hashApiKey(key)).toBe(hashApiKey(key));
    });

    it('should return different hashes for different keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(hashApiKey(key1)).not.toBe(hashApiKey(key2));
    });
  });

  describe('createApiKeyHash', () => {
    it('should create an ApiKeyHash from a valid hash', () => {
      const hash = 'a'.repeat(64);
      const apiKeyHash = createApiKeyHash(hash);
      expect(apiKeyHash).toBe(hash);
    });

    it('should throw for invalid hash', () => {
      expect(() => createApiKeyHash('')).toThrow('Invalid API key hash');
      expect(() => createApiKeyHash('short')).toThrow('Invalid API key hash');
      expect(() => createApiKeyHash('a'.repeat(63))).toThrow('Invalid API key hash');
      expect(() => createApiKeyHash('a'.repeat(65))).toThrow('Invalid API key hash');
    });
  });
});

describe('Agent Entity', () => {
  const validProps = {
    displayName: 'Test Agent',
    description: 'A test agent',
  };

  describe('Agent.create', () => {
    it('should create an agent with valid properties', () => {
      const { agent, apiKey } = Agent.create(validProps);

      expect(agent.displayName).toBe('Test Agent');
      expect(agent.description).toBe('A test agent');
      expect(agent.type).toBe('agent');
      expect(agent.ownerActorId).toBeNull();
      expect(agent.isActive).toBe(true);
      expect(isValidApiKey(apiKey)).toBe(true);
    });

    it('should return a plaintext API key', () => {
      const { agent, apiKey } = Agent.create(validProps);
      expect(apiKey).toMatch(/^fr_live_[a-f0-9]{64}$/);
      expect(agent.verifyApiKey(apiKey)).toBe(true);
    });

    it('should generate an ID if not provided', () => {
      const { agent } = Agent.create(validProps);
      expect(agent.id).toBeDefined();
      expect(agent.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should use provided ID', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const { agent } = Agent.create({ ...validProps, id });
      expect(agent.id).toBe(id);
    });

    it('should set ownerActorId if provided', () => {
      const ownerId = generateActorId();
      const { agent } = Agent.create({ ...validProps, ownerActorId: ownerId });
      expect(agent.ownerActorId).toBe(ownerId);
    });

    it('should accept ownerActorId as string', () => {
      const ownerIdString = '550e8400-e29b-41d4-a716-446655440000';
      const { agent } = Agent.create({ ...validProps, ownerActorId: ownerIdString });
      expect(agent.ownerActorId).toBe(ownerIdString);
    });

    it('should use custom API key prefix', () => {
      const { apiKey } = Agent.create({ ...validProps, apiKeyPrefix: 'test' });
      expect(apiKey).toMatch(/^fr_test_/);
    });

    it('should initialize empty metadata if not provided', () => {
      const { agent } = Agent.create(validProps);
      expect(agent.metadata).toEqual({});
    });

    it('should set metadata if provided', () => {
      const { agent } = Agent.create({
        ...validProps,
        metadata: { key: 'value', count: 42 },
      });
      expect(agent.metadata).toEqual({ key: 'value', count: 42 });
    });

    it('should throw for description exceeding 500 characters', () => {
      expect(() =>
        Agent.create({ ...validProps, description: 'a'.repeat(501) })
      ).toThrow('Description cannot exceed 500 characters');
    });

    it('should throw for empty display name', () => {
      expect(() =>
        Agent.create({ ...validProps, displayName: '' })
      ).toThrow('Display name cannot be empty');
    });
  });

  describe('Agent.fromPersistence', () => {
    it('should reconstitute an agent from persisted data', () => {
      const now = new Date();
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const apiKeyHash = createApiKeyHash('a'.repeat(64));
      const ownerId = createActorId('660e8400-e29b-41d4-a716-446655440001');

      const agent = Agent.fromPersistence({
        id,
        type: 'agent',
        displayName: 'Persisted Agent',
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        apiKeyHash,
        ownerActorId: ownerId,
        description: 'A persisted agent',
        metadata: { key: 'value' },
      });

      expect(agent.id).toBe(id);
      expect(agent.displayName).toBe('Persisted Agent');
      expect(agent.ownerActorId).toBe(ownerId);
      expect(agent.description).toBe('A persisted agent');
      expect(agent.metadata).toEqual({ key: 'value' });
    });
  });

  describe('rotateApiKey', () => {
    it('should generate a new API key', () => {
      const { agent, apiKey: oldKey } = Agent.create(validProps);
      const newKey = agent.rotateApiKey();

      expect(newKey).not.toBe(oldKey);
      expect(isValidApiKey(newKey)).toBe(true);
      expect(agent.verifyApiKey(newKey)).toBe(true);
      expect(agent.verifyApiKey(oldKey)).toBe(false);
    });

    it('should use custom prefix for rotated key', () => {
      const { agent } = Agent.create(validProps);
      const newKey = agent.rotateApiKey('staging');
      expect(newKey).toMatch(/^fr_staging_/);
    });
  });

  describe('verifyApiKey', () => {
    it('should return true for correct key', () => {
      const { agent, apiKey } = Agent.create(validProps);
      expect(agent.verifyApiKey(apiKey)).toBe(true);
    });

    it('should return false for incorrect key', () => {
      const { agent } = Agent.create(validProps);
      const wrongKey = generateApiKey();
      expect(agent.verifyApiKey(wrongKey)).toBe(false);
    });
  });

  describe('updateDescription', () => {
    it('should update description', () => {
      const { agent } = Agent.create(validProps);
      agent.updateDescription('New description');
      expect(agent.description).toBe('New description');
    });

    it('should allow null description', () => {
      const { agent } = Agent.create(validProps);
      agent.updateDescription(null);
      expect(agent.description).toBeNull();
    });

    it('should throw for description exceeding 500 characters', () => {
      const { agent } = Agent.create(validProps);
      expect(() => agent.updateDescription('a'.repeat(501))).toThrow(
        'Description cannot exceed 500 characters'
      );
    });
  });

  describe('updateOwner', () => {
    it('should update owner with ActorId', () => {
      const { agent } = Agent.create(validProps);
      const newOwnerId = generateActorId();
      agent.updateOwner(newOwnerId);
      expect(agent.ownerActorId).toBe(newOwnerId);
    });

    it('should update owner with string', () => {
      const { agent } = Agent.create(validProps);
      const newOwnerIdString = '550e8400-e29b-41d4-a716-446655440000';
      agent.updateOwner(newOwnerIdString);
      expect(agent.ownerActorId).toBe(newOwnerIdString);
    });

    it('should allow removing owner', () => {
      const ownerId = generateActorId();
      const { agent } = Agent.create({ ...validProps, ownerActorId: ownerId });
      agent.updateOwner(null);
      expect(agent.ownerActorId).toBeNull();
    });

    it('should throw for invalid owner ID string', () => {
      const { agent } = Agent.create(validProps);
      expect(() => agent.updateOwner('invalid-uuid')).toThrow('Invalid ActorId');
    });
  });

  describe('metadata operations', () => {
    it('should set metadata value', () => {
      const { agent } = Agent.create(validProps);
      agent.setMetadata('key', 'value');
      expect(agent.metadata).toEqual({ key: 'value' });
    });

    it('should update existing metadata value', () => {
      const { agent } = Agent.create({ ...validProps, metadata: { key: 'old' } });
      agent.setMetadata('key', 'new');
      expect(agent.metadata.key).toBe('new');
    });

    it('should remove metadata value', () => {
      const { agent } = Agent.create({
        ...validProps,
        metadata: { key1: 'value1', key2: 'value2' },
      });
      agent.removeMetadata('key1');
      expect(agent.metadata).toEqual({ key2: 'value2' });
    });

    it('should clear all metadata', () => {
      const { agent } = Agent.create({
        ...validProps,
        metadata: { key1: 'value1', key2: 'value2' },
      });
      agent.clearMetadata();
      expect(agent.metadata).toEqual({});
    });

    it('should return a copy of metadata', () => {
      const { agent } = Agent.create({ ...validProps, metadata: { key: 'value' } });
      const metadata = agent.metadata;
      metadata.key = 'modified';
      expect(agent.metadata.key).toBe('value');
    });
  });

  describe('toJSON', () => {
    it('should serialize agent to JSON', () => {
      const id = createActorId('550e8400-e29b-41d4-a716-446655440000');
      const ownerId = createActorId('660e8400-e29b-41d4-a716-446655440001');
      const { agent } = Agent.create({
        id,
        displayName: 'Test Agent',
        description: 'A test agent',
        ownerActorId: ownerId,
        metadata: { key: 'value' },
      });

      const json = agent.toJSON();

      expect(json).toMatchObject({
        id,
        type: 'agent',
        displayName: 'Test Agent',
        description: 'A test agent',
        ownerActorId: ownerId,
        metadata: { key: 'value' },
        isActive: true,
      });
      expect(json.apiKeyHash).toBeDefined();
      expect(json.apiKeyHash.length).toBe(64);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('inherited behavior', () => {
    it('should support display name update', () => {
      const { agent } = Agent.create(validProps);
      agent.updateDisplayName('New Name');
      expect(agent.displayName).toBe('New Name');
    });

    it('should support avatar URL update', () => {
      const { agent } = Agent.create(validProps);
      agent.updateAvatarUrl('https://example.com/avatar.png');
      expect(agent.avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should support deactivation', () => {
      const { agent } = Agent.create(validProps);
      agent.deactivate();
      expect(agent.isActive).toBe(false);
    });

    it('should support reactivation', () => {
      const { agent } = Agent.create(validProps);
      agent.deactivate();
      agent.activate();
      expect(agent.isActive).toBe(true);
    });
  });
});
