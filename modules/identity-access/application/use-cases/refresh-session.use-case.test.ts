import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RefreshSessionUseCase,
  SessionNotFoundError,
  SessionExpiredError,
} from './refresh-session.use-case';
import type { RefreshSessionDeps } from './refresh-session.use-case';
import {
  Session,
  createSessionId,
  createActorId,
  createExpirationDate,
  SESSION_DURATIONS,
} from '../../domain';
import type { SessionRepository } from '../ports/session.repository';

// ============================================================================
// Mock Implementations
// ============================================================================

function createMockSessionRepository(): SessionRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByToken: vi.fn().mockResolvedValue(null),
    findByActorId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    deleteByToken: vi.fn().mockResolvedValue(undefined),
    deleteByActorId: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockSession(props: {
  actorId?: string;
  actorType?: 'user' | 'agent';
  isExpired?: boolean;
}): Session {
  const now = new Date();
  const expiresAt = props.isExpired
    ? new Date(now.getTime() - 1000) // Past
    : createExpirationDate(SESSION_DURATIONS.DEFAULT);

  return Session.fromPersistence({
    id: createSessionId('550e8400-e29b-41d4-a716-446655440000'),
    actorId: createActorId(props.actorId ?? '550e8400-e29b-41d4-a716-446655440001'),
    actorType: props.actorType ?? 'user',
    tokenHash: 'abc123hash',
    expiresAt,
    createdAt: now,
    lastAccessedAt: now,
    userAgent: null,
    ipAddress: null,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('RefreshSessionUseCase', () => {
  let useCase: RefreshSessionUseCase;
  let mockSessionRepo: SessionRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();

    const deps: RefreshSessionDeps = {
      sessionRepository: mockSessionRepo,
    };

    useCase = new RefreshSessionUseCase(deps);
  });

  describe('successful refresh', () => {
    it('should create a new session when given a valid token', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const result = await useCase.execute('valid-session-token-that-is-at-least-32-chars');

      expect(result.sessionToken).toBeDefined();
      expect(result.sessionToken.length).toBeGreaterThanOrEqual(32);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should save the new session', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      await useCase.execute('valid-session-token-that-is-at-least-32-chars');

      expect(mockSessionRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should delete the old session by token', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const oldToken = 'valid-session-token-that-is-at-least-32-chars';
      await useCase.execute(oldToken);

      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(oldToken);
    });

    it('should look up the session by the provided token', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const token = 'valid-session-token-that-is-at-least-32-chars';
      await useCase.execute(token);

      expect(mockSessionRepo.findByToken).toHaveBeenCalledWith(token);
    });

    it('should preserve the actorId and actorType from the old session', async () => {
      const actorId = '550e8400-e29b-41d4-a716-446655440099';
      const session = createMockSession({ actorId, actorType: 'agent' });
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const result = await useCase.execute('valid-session-token-that-is-at-least-32-chars');

      expect(result.actorId).toBe(actorId);
      expect(result.actorType).toBe('agent');
    });

    it('should delete the old session before saving the new one (rotation)', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const callOrder: string[] = [];
      vi.mocked(mockSessionRepo.deleteByToken).mockImplementation(() => {
        callOrder.push('deleteByToken');
        return Promise.resolve();
      });
      vi.mocked(mockSessionRepo.save).mockImplementation(() => {
        callOrder.push('save');
        return Promise.resolve();
      });

      await useCase.execute('valid-session-token-that-is-at-least-32-chars');

      expect(callOrder).toEqual(['deleteByToken', 'save']);
    });
  });

  describe('rotation invalidates old token', () => {
    it('should delete old session so old token is no longer valid', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      const oldToken = 'valid-session-token-that-is-at-least-32-chars';
      await useCase.execute(oldToken);

      // The old session must have been deleted by token
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledTimes(1);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(oldToken);
    });
  });

  describe('expired session', () => {
    it('should reject with SessionExpiredError when session is expired', async () => {
      const session = createMockSession({ isExpired: true });
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      await expect(
        useCase.execute('expired-session-token-that-is-at-least-32-chars')
      ).rejects.toThrow(SessionExpiredError);
    });

    it('should not create a new session when old session is expired', async () => {
      const session = createMockSession({ isExpired: true });
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      try {
        await useCase.execute('expired-session-token-that-is-at-least-32-chars');
      } catch {
        // Expected error
      }

      expect(mockSessionRepo.save).not.toHaveBeenCalled();
    });

    it('should not delete the old session when it is expired', async () => {
      const session = createMockSession({ isExpired: true });
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);

      try {
        await useCase.execute('expired-session-token-that-is-at-least-32-chars');
      } catch {
        // Expected error
      }

      expect(mockSessionRepo.deleteByToken).not.toHaveBeenCalled();
    });
  });

  describe('invalid or nonexistent token', () => {
    it('should reject with SessionNotFoundError when session does not exist', async () => {
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(null);

      await expect(
        useCase.execute('nonexistent-session-token-that-is-at-least-32-chars')
      ).rejects.toThrow(SessionNotFoundError);
    });

    it('should not create a new session when token is invalid', async () => {
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(null);

      try {
        await useCase.execute('nonexistent-session-token-that-is-at-least-32-chars');
      } catch {
        // Expected error
      }

      expect(mockSessionRepo.save).not.toHaveBeenCalled();
    });

    it('should not delete any session when token is invalid', async () => {
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(null);

      try {
        await useCase.execute('nonexistent-session-token-that-is-at-least-32-chars');
      } catch {
        // Expected error
      }

      expect(mockSessionRepo.deleteByToken).not.toHaveBeenCalled();
    });
  });

  describe('repository errors', () => {
    it('should propagate repository errors from findByToken', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockSessionRepo.findByToken).mockRejectedValue(error);

      await expect(
        useCase.execute('valid-session-token-that-is-at-least-32-chars')
      ).rejects.toThrow('Database connection failed');
    });

    it('should propagate repository errors from save', async () => {
      const session = createMockSession({});
      vi.mocked(mockSessionRepo.findByToken).mockResolvedValue(session);
      const error = new Error('Save failed');
      vi.mocked(mockSessionRepo.save).mockRejectedValue(error);

      await expect(
        useCase.execute('valid-session-token-that-is-at-least-32-chars')
      ).rejects.toThrow('Save failed');
    });
  });
});
