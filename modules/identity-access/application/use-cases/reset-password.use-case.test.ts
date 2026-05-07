import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RequestPasswordResetUseCase,
  CompletePasswordResetUseCase,
  InvalidResetTokenError,
  ResetTokenExpiredError,
  ResetTokenAlreadyUsedError,
  AccountDeactivatedForResetError,
  WeakPasswordError,
  UserNotFoundForResetError,
  hashResetToken,
  generateResetToken,
  RESET_TOKEN_DURATION_MS,
} from './reset-password.use-case';
import type { RequestPasswordResetDeps, CompletePasswordResetDeps } from './reset-password.use-case';
import { User, createEmail, createPasswordHash } from '../../domain';
import type { ActorId } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { ResetTokenRepository, ResetToken } from '../ports/reset-token.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { EventEmitterPort } from '../ports/event-emitter.port';

// ============================================================================
// Mock Implementations
// ============================================================================

function createMockUserRepository(): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByType: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

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

function createMockResetTokenRepository(): ResetTokenRepository {
  return {
    findByTokenHash: vi.fn().mockResolvedValue(null),
    findActiveByUserId: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (input) => ({
      id: '550e8400-e29b-41d4-a716-446655440099',
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
      usedAt: null,
    })),
    markAsUsed: vi.fn().mockResolvedValue(undefined),
    invalidateAllForUser: vi.fn().mockResolvedValue(undefined),
    deleteExpired: vi.fn().mockResolvedValue(0),
  };
}

function createMockPasswordHasher(): PasswordHasherPort {
  return {
    hash: vi.fn().mockImplementation((password: string) =>
      Promise.resolve(`$2b$10$hashed_${password}`)
    ),
    verify: vi.fn().mockResolvedValue(true),
  };
}

function createMockEventEmitter(): EventEmitterPort {
  return {
    emit: vi.fn().mockResolvedValue(undefined),
    emitMany: vi.fn().mockResolvedValue(undefined),
  };
}

function createTestUser(overrides?: Partial<{
  id: string;
  email: string;
  isActive: boolean;
}>): User {
  const email = createEmail(overrides?.email ?? 'test@example.com');
  const passwordHash = createPasswordHash('$2b$10$validhashvalue');

  return User.fromPersistence({
    id: (overrides?.id ?? '550e8400-e29b-41d4-a716-446655440000') as ActorId,
    type: 'user',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: overrides?.isActive ?? true,
    email,
    passwordHash,
    emailVerified: true,
    lastLoginAt: null,
  });
}

function createTestResetToken(overrides?: Partial<ResetToken>): ResetToken {
  const token = generateResetToken();
  return {
    id: '550e8400-e29b-41d4-a716-446655440099',
    userId: '550e8400-e29b-41d4-a716-446655440000' as ActorId,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
    createdAt: new Date(),
    usedAt: null,
    ...overrides,
  };
}

// ============================================================================
// RequestPasswordResetUseCase Tests
// ============================================================================

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let mockUserRepo: UserRepository;
  let mockResetTokenRepo: ResetTokenRepository;
  let mockEventEmitter: EventEmitterPort;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockResetTokenRepo = createMockResetTokenRepository();
    mockEventEmitter = createMockEventEmitter();

    const deps: RequestPasswordResetDeps = {
      userRepository: mockUserRepo,
      resetTokenRepository: mockResetTokenRepo,
      eventEmitter: mockEventEmitter,
    };

    useCase = new RequestPasswordResetUseCase(deps);
  });

  describe('execute (public method - no user existence leak)', () => {
    it('should return success when user exists', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.execute({ email: 'test@example.com' });

      expect(result.success).toBe(true);
    });

    it('should return success even when user does not exist (prevent enumeration)', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      const result = await useCase.execute({ email: 'nonexistent@example.com' });

      expect(result.success).toBe(true);
    });

    it('should return success for deactivated accounts (prevent enumeration)', async () => {
      const user = createTestUser({ isActive: false });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.execute({ email: 'test@example.com' });

      expect(result.success).toBe(true);
    });

    it('should not create token when user does not exist', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      await useCase.execute({ email: 'nonexistent@example.com' });

      expect(mockResetTokenRepo.create).not.toHaveBeenCalled();
    });

    it('should not emit event when user does not exist', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      await useCase.execute({ email: 'nonexistent@example.com' });

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create reset token when user exists', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute({ email: 'test@example.com' });

      expect(mockResetTokenRepo.create).toHaveBeenCalledTimes(1);
      expect(mockResetTokenRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
    });

    it('should invalidate existing tokens before creating new one', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      // Track call order
      const callOrder: string[] = [];
      vi.mocked(mockResetTokenRepo.invalidateAllForUser).mockImplementation(async () => {
        callOrder.push('invalidate');
      });
      vi.mocked(mockResetTokenRepo.create).mockImplementation(async (input) => {
        callOrder.push('create');
        return {
          id: '550e8400-e29b-41d4-a716-446655440099',
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          createdAt: new Date(),
          usedAt: null,
        };
      });

      await useCase.execute({ email: 'test@example.com' });

      expect(mockResetTokenRepo.invalidateAllForUser).toHaveBeenCalledWith(user.id);
      expect(callOrder).toEqual(['invalidate', 'create']);
    });

    it('should emit PasswordResetRequested event', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute({ email: 'test@example.com' });

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'identity.user.password_reset_requested',
          aggregateId: user.id,
          aggregateType: 'user',
          payload: expect.objectContaining({
            userId: user.id,
            email: user.email,
            token: expect.any(String),
            expiresAt: expect.any(String),
          }),
        })
      );
    });

    it('should set token expiration to 1 hour', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const beforeCall = Date.now();
      await useCase.execute({ email: 'test@example.com' });
      const afterCall = Date.now();

      const createCalls = vi.mocked(mockResetTokenRepo.create).mock.calls;
      expect(createCalls.length).toBeGreaterThan(0);
      const createCall = createCalls[0]![0];
      const expiresAt = createCall.expiresAt.getTime();

      // Token should expire approximately 1 hour from now
      expect(expiresAt).toBeGreaterThanOrEqual(beforeCall + RESET_TOKEN_DURATION_MS - 1000);
      expect(expiresAt).toBeLessThanOrEqual(afterCall + RESET_TOKEN_DURATION_MS + 1000);
    });

    it('should normalize email to lowercase', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute({ email: 'TEST@EXAMPLE.COM' });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        createEmail('test@example.com')
      );
    });

    it('should throw for invalid email format', async () => {
      await expect(
        useCase.execute({ email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('executeWithValidation (internal method - throws on not found)', () => {
    it('should return token and expiration when user exists', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.executeWithValidation({ email: 'test@example.com' });

      expect(result.token).toBeDefined();
      expect(result.token.length).toBeGreaterThan(30);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw UserNotFoundForResetError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      await expect(
        useCase.executeWithValidation({ email: 'nonexistent@example.com' })
      ).rejects.toThrow(UserNotFoundForResetError);
    });

    it('should throw AccountDeactivatedForResetError for deactivated accounts', async () => {
      const user = createTestUser({ isActive: false });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await expect(
        useCase.executeWithValidation({ email: 'test@example.com' })
      ).rejects.toThrow(AccountDeactivatedForResetError);
    });
  });
});

// ============================================================================
// CompletePasswordResetUseCase Tests
// ============================================================================

describe('CompletePasswordResetUseCase', () => {
  let useCase: CompletePasswordResetUseCase;
  let mockUserRepo: UserRepository;
  let mockSessionRepo: SessionRepository;
  let mockResetTokenRepo: ResetTokenRepository;
  let mockPasswordHasher: PasswordHasherPort;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockSessionRepo = createMockSessionRepository();
    mockResetTokenRepo = createMockResetTokenRepository();
    mockPasswordHasher = createMockPasswordHasher();

    const deps: CompletePasswordResetDeps = {
      userRepository: mockUserRepo,
      sessionRepository: mockSessionRepo,
      resetTokenRepository: mockResetTokenRepo,
      passwordHasher: mockPasswordHasher,
    };

    useCase = new CompletePasswordResetUseCase(deps);
  });

  const validInput = {
    token: generateResetToken(),
    newPassword: 'NewSecurePassword123',
  };

  describe('successful password reset', () => {
    it('should reset password successfully with valid token', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(user.id);
    });

    it('should hash the new password', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(validInput.newPassword);
    });

    it('should update user password', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should invalidate all existing sessions', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockSessionRepo.deleteByActorId).toHaveBeenCalledWith(user.id);
    });

    it('should mark token as used', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockResetTokenRepo.markAsUsed).toHaveBeenCalledWith(tokenHash);
    });

    it('should invalidate all other pending tokens for user', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockResetTokenRepo.invalidateAllForUser).toHaveBeenCalledWith(user.id);
    });
  });

  describe('token validation', () => {
    it('should throw InvalidResetTokenError when token not found', async () => {
      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(InvalidResetTokenError);
    });

    it('should throw ResetTokenAlreadyUsedError when token already used', async () => {
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({
        tokenHash,
        usedAt: new Date(), // Token has been used
      });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);

      await expect(useCase.execute(validInput)).rejects.toThrow(ResetTokenAlreadyUsedError);
    });

    it('should throw ResetTokenExpiredError when token is expired', async () => {
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({
        tokenHash,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);

      await expect(useCase.execute(validInput)).rejects.toThrow(ResetTokenExpiredError);
    });

    it('should throw InvalidResetTokenError when user no longer exists', async () => {
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(InvalidResetTokenError);
      await expect(useCase.execute(validInput)).rejects.toThrow('User no longer exists');
    });

    it('should throw AccountDeactivatedForResetError when user is deactivated', async () => {
      const user = createTestUser({ isActive: false });
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      await expect(useCase.execute(validInput)).rejects.toThrow(AccountDeactivatedForResetError);
    });
  });

  describe('password validation', () => {
    it('should throw WeakPasswordError for passwords shorter than 8 characters', async () => {
      await expect(
        useCase.execute({ token: validInput.token, newPassword: 'short' })
      ).rejects.toThrow(WeakPasswordError);
      await expect(
        useCase.execute({ token: validInput.token, newPassword: 'short' })
      ).rejects.toThrow('Password must be at least 8 characters');
    });

    it('should throw WeakPasswordError for empty password', async () => {
      await expect(
        useCase.execute({ token: validInput.token, newPassword: '' })
      ).rejects.toThrow(WeakPasswordError);
    });

    it('should accept password with exactly 8 characters', async () => {
      const user = createTestUser();
      const tokenHash = hashResetToken(validInput.token);
      const resetToken = createTestResetToken({ tokenHash });

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(resetToken);
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

      const result = await useCase.execute({
        token: validInput.token,
        newPassword: '12345678',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('security measures', () => {
    it('should not save user if token lookup fails', async () => {
      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(null);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected
      }

      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should not invalidate sessions if token validation fails', async () => {
      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(null);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected
      }

      expect(mockSessionRepo.deleteByActorId).not.toHaveBeenCalled();
    });

    it('should hash token for lookup (timing attack mitigation)', async () => {
      const token = generateResetToken();
      const expectedHash = hashResetToken(token);

      vi.mocked(mockResetTokenRepo.findByTokenHash).mockResolvedValue(null);

      try {
        await useCase.execute({ token, newPassword: 'NewPassword123' });
      } catch {
        // Expected
      }

      expect(mockResetTokenRepo.findByTokenHash).toHaveBeenCalledWith(expectedHash);
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Reset Token Utilities', () => {
  describe('generateResetToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateResetToken();
      // 32 bytes in base64url = 43 characters
      expect(token.length).toBe(43);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set(
        Array.from({ length: 100 }, () => generateResetToken())
      );
      expect(tokens.size).toBe(100);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateResetToken();
      expect(token).not.toMatch(/[+/=]/);
    });
  });

  describe('hashResetToken', () => {
    it('should produce consistent hashes', () => {
      const token = 'test-token';
      const hash1 = hashResetToken(token);
      const hash2 = hashResetToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce hex string of 64 characters (SHA-256)', () => {
      const hash = hashResetToken('test-token');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashResetToken('token1');
      const hash2 = hashResetToken('token2');
      expect(hash1).not.toBe(hash2);
    });
  });
});
