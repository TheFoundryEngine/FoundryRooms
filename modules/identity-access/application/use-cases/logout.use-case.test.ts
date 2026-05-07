import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUseCase } from './logout.use-case';
import type { LogoutDeps } from './logout.use-case';
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

// ============================================================================
// Tests
// ============================================================================

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockSessionRepo: SessionRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();

    const deps: LogoutDeps = {
      sessionRepository: mockSessionRepo,
    };

    useCase = new LogoutUseCase(deps);
  });

  describe('successful logout', () => {
    it('should delete session by token', async () => {
      const sessionToken = 'valid-session-token-12345';

      const result = await useCase.execute({ sessionToken });

      expect(result.success).toBe(true);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(sessionToken);
    });

    it('should return success even if session does not exist (idempotent)', async () => {
      // deleteByToken doesn't throw even if session doesn't exist
      const sessionToken = 'non-existent-token';

      const result = await useCase.execute({ sessionToken });

      expect(result.success).toBe(true);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(sessionToken);
    });

    it('should work with user session tokens', async () => {
      const sessionToken = 'user-session-token';

      const result = await useCase.execute({ sessionToken });

      expect(result.success).toBe(true);
    });

    it('should work with agent session tokens', async () => {
      const sessionToken = 'agent-session-token';

      const result = await useCase.execute({ sessionToken });

      expect(result.success).toBe(true);
    });

    it('should call deleteByToken exactly once', async () => {
      const sessionToken = 'test-token';

      await useCase.execute({ sessionToken });

      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty token string', async () => {
      const result = await useCase.execute({ sessionToken: '' });

      expect(result.success).toBe(true);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith('');
    });

    it('should handle very long token strings', async () => {
      const longToken = 'a'.repeat(1000);

      const result = await useCase.execute({ sessionToken: longToken });

      expect(result.success).toBe(true);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(longToken);
    });

    it('should handle special characters in token', async () => {
      const specialToken = 'token-with+special/chars=test';

      const result = await useCase.execute({ sessionToken: specialToken });

      expect(result.success).toBe(true);
      expect(mockSessionRepo.deleteByToken).toHaveBeenCalledWith(specialToken);
    });
  });

  describe('repository errors', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockSessionRepo.deleteByToken).mockRejectedValue(error);

      await expect(
        useCase.execute({ sessionToken: 'test-token' })
      ).rejects.toThrow('Database connection failed');
    });
  });
});
