import { describe, it, expect } from 'vitest';
import type { SessionId, SessionToken } from './session.entity';
import {
  Session,
  createSessionId,
  generateSessionId,
  generateSessionToken,
  createSessionToken,
  hashSessionToken,
  SESSION_DURATIONS,
  createExpirationDate,
} from './session.entity';
import { generateActorId } from './actor.entity';

// Type assertions to use the imported types
const _typeCheckSessionId: SessionId = '' as SessionId;
const _typeCheckSessionToken: SessionToken = '' as SessionToken;
void _typeCheckSessionId;
void _typeCheckSessionToken;

describe('SessionId Value Object', () => {
  describe('createSessionId', () => {
    it('should create a SessionId from a valid UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = createSessionId(uuid);
      expect(sessionId).toBe(uuid);
    });

    it('should accept uppercase UUIDs', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const sessionId = createSessionId(uuid);
      expect(sessionId).toBe(uuid);
    });

    it('should throw for invalid UUID format', () => {
      expect(() => createSessionId('not-a-uuid')).toThrow('Invalid SessionId');
      expect(() => createSessionId('')).toThrow('Invalid SessionId');
    });
  });

  describe('generateSessionId', () => {
    it('should generate a valid UUID', () => {
      const id = generateSessionId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });
});

describe('SessionToken Value Object', () => {
  describe('generateSessionToken', () => {
    it('should generate a base64url token', () => {
      const token = generateSessionToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(token.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      expect(token1).not.toBe(token2);
    });

    it('should not contain URL-unsafe characters', () => {
      const token = generateSessionToken();
      expect(token).not.toContain('+');
      expect(token).not.toContain('/');
      expect(token).not.toContain('=');
    });
  });

  describe('createSessionToken', () => {
    it('should create a SessionToken from a valid string', () => {
      const token = createSessionToken('a'.repeat(43));
      expect(token).toBe('a'.repeat(43));
    });

    it('should throw for empty token', () => {
      expect(() => createSessionToken('')).toThrow('Invalid session token');
    });

    it('should throw for token too short', () => {
      expect(() => createSessionToken('short')).toThrow('Invalid session token');
    });
  });

  describe('hashSessionToken', () => {
    it('should return a 64-character hex hash', () => {
      const token = generateSessionToken();
      const hash = hashSessionToken(token);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should return same hash for same token', () => {
      const token = generateSessionToken();
      expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    });

    it('should return different hashes for different tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      expect(hashSessionToken(token1)).not.toBe(hashSessionToken(token2));
    });
  });
});

describe('Session Entity', () => {
  const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
  const actorId = generateActorId();

  describe('Session.create', () => {
    it('should create a session with valid properties', () => {
      const { session, token } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.actorId).toBe(actorId);
      expect(session.actorType).toBe('user');
      expect(session.expiresAt).toEqual(futureDate);
      expect(session.isExpired()).toBe(false);
      expect(token).toBeDefined();
      expect(session.verifyToken(token)).toBe(true);
    });

    it('should work with agent actor type', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'agent',
        expiresAt: futureDate,
      });

      expect(session.actorType).toBe('agent');
    });

    it('should generate an ID if not provided', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.id).toBeDefined();
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should use provided ID', () => {
      const id = createSessionId('550e8400-e29b-41d4-a716-446655440000');
      const { session } = Session.create({
        id,
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.id).toBe(id);
    });

    it('should accept actorId as string', () => {
      const actorIdString = '550e8400-e29b-41d4-a716-446655440000';
      const { session } = Session.create({
        actorId: actorIdString,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.actorId).toBe(actorIdString);
    });

    it('should set createdAt and lastAccessedAt to now', () => {
      const before = new Date();
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });
      const after = new Date();

      expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(session.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session.lastAccessedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should store userAgent and ipAddress', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      });

      expect(session.userAgent).toBe('Mozilla/5.0');
      expect(session.ipAddress).toBe('192.168.1.1');
    });

    it('should default userAgent and ipAddress to null', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.userAgent).toBeNull();
      expect(session.ipAddress).toBeNull();
    });

    it('should throw if expiration is in the past', () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(() =>
        Session.create({
          actorId,
          actorType: 'user',
          expiresAt: pastDate,
        })
      ).toThrow('Session expiration must be in the future');
    });

    it('should throw for invalid actorId string', () => {
      expect(() =>
        Session.create({
          actorId: 'invalid-uuid',
          actorType: 'user',
          expiresAt: futureDate,
        })
      ).toThrow('Invalid ActorId');
    });
  });

  describe('Session.fromPersistence', () => {
    it('should reconstitute a session from persisted data', () => {
      const now = new Date();
      const id = createSessionId('550e8400-e29b-41d4-a716-446655440000');

      const session = Session.fromPersistence({
        id,
        actorId,
        actorType: 'user',
        tokenHash: 'a'.repeat(64),
        expiresAt: futureDate,
        createdAt: now,
        lastAccessedAt: now,
        userAgent: 'Test Agent',
        ipAddress: '10.0.0.1',
      });

      expect(session.id).toBe(id);
      expect(session.actorId).toBe(actorId);
      expect(session.userAgent).toBe('Test Agent');
      expect(session.ipAddress).toBe('10.0.0.1');
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired session', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.isExpired()).toBe(false);
    });

    it('should return true for expired session', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000);

      const session = Session.fromPersistence({
        id: generateSessionId(),
        actorId,
        actorType: 'user',
        tokenHash: 'a'.repeat(64),
        expiresAt: pastDate,
        createdAt: now,
        lastAccessedAt: now,
      });

      expect(session.isExpired()).toBe(true);
    });

    it('should accept custom now date', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      const futureNow = new Date(futureDate.getTime() + 1000);
      expect(session.isExpired(futureNow)).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true for non-expired session', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.isValid()).toBe(true);
    });

    it('should return false for expired session', () => {
      const now = new Date();
      const session = Session.fromPersistence({
        id: generateSessionId(),
        actorId,
        actorType: 'user',
        tokenHash: 'a'.repeat(64),
        expiresAt: new Date(now.getTime() - 1000),
        createdAt: now,
        lastAccessedAt: now,
      });

      expect(session.isValid()).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should return true for correct token', () => {
      const { session, token } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      expect(session.verifyToken(token)).toBe(true);
    });

    it('should return false for incorrect token', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      const wrongToken = generateSessionToken();
      expect(session.verifyToken(wrongToken)).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    it('should return positive remaining time for non-expired session', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt,
      });

      const remaining = session.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(3600000);
    });

    it('should return 0 for expired session', () => {
      const now = new Date();
      const session = Session.fromPersistence({
        id: generateSessionId(),
        actorId,
        actorType: 'user',
        tokenHash: 'a'.repeat(64),
        expiresAt: new Date(now.getTime() - 1000),
        createdAt: now,
        lastAccessedAt: now,
      });

      expect(session.getRemainingTime()).toBe(0);
    });
  });

  describe('touch', () => {
    it('should update lastAccessedAt', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      const originalLastAccessed = session.lastAccessedAt;

      // Small delay
      session.touch();

      expect(session.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
        originalLastAccessed.getTime()
      );
    });
  });

  describe('updateMetadata', () => {
    it('should update userAgent', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      session.updateMetadata({ userAgent: 'New Agent' });
      expect(session.userAgent).toBe('New Agent');
    });

    it('should update ipAddress', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      session.updateMetadata({ ipAddress: '192.168.1.100' });
      expect(session.ipAddress).toBe('192.168.1.100');
    });

    it('should update both values', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
      });

      session.updateMetadata({
        userAgent: 'Updated Agent',
        ipAddress: '10.0.0.1',
      });

      expect(session.userAgent).toBe('Updated Agent');
      expect(session.ipAddress).toBe('10.0.0.1');
    });

    it('should allow setting to null', () => {
      const { session } = Session.create({
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
        userAgent: 'Initial',
        ipAddress: '1.1.1.1',
      });

      session.updateMetadata({ userAgent: null, ipAddress: null });

      expect(session.userAgent).toBeNull();
      expect(session.ipAddress).toBeNull();
    });
  });

  describe('toJSON', () => {
    it('should serialize session to JSON', () => {
      const id = createSessionId('550e8400-e29b-41d4-a716-446655440000');
      const { session } = Session.create({
        id,
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
        userAgent: 'Test Agent',
        ipAddress: '192.168.1.1',
      });

      const json = session.toJSON();

      expect(json).toMatchObject({
        id,
        actorId,
        actorType: 'user',
        expiresAt: futureDate,
        userAgent: 'Test Agent',
        ipAddress: '192.168.1.1',
      });
      expect(json.tokenHash).toBeDefined();
      expect(json.tokenHash.length).toBe(64);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.lastAccessedAt).toBeInstanceOf(Date);
    });
  });
});

describe('Session Duration Helpers', () => {
  describe('SESSION_DURATIONS', () => {
    it('should have correct duration values', () => {
      expect(SESSION_DURATIONS.SHORT).toBe(60 * 60 * 1000); // 1 hour
      expect(SESSION_DURATIONS.DEFAULT).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(SESSION_DURATIONS.EXTENDED).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
      expect(SESSION_DURATIONS.LONG).toBe(30 * 24 * 60 * 60 * 1000); // 30 days
    });
  });

  describe('createExpirationDate', () => {
    it('should create expiration date from duration', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiration = createExpirationDate(SESSION_DURATIONS.DEFAULT, now);

      expect(expiration.getTime()).toBe(now.getTime() + SESSION_DURATIONS.DEFAULT);
    });

    it('should use current time if not specified', () => {
      const before = Date.now();
      const expiration = createExpirationDate(SESSION_DURATIONS.SHORT);
      const after = Date.now();

      expect(expiration.getTime()).toBeGreaterThanOrEqual(
        before + SESSION_DURATIONS.SHORT
      );
      expect(expiration.getTime()).toBeLessThanOrEqual(
        after + SESSION_DURATIONS.SHORT
      );
    });
  });
});
