import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LoginUseCase,
  InvalidCredentialsError,
  AccountDeactivatedError,
} from './login.use-case';
import type { LoginDeps } from './login.use-case';
import { User, createEmail, createPasswordHash, SESSION_DURATIONS } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';

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

function createMockPasswordHasher(): PasswordHasherPort {
  return {
    hash: vi.fn().mockImplementation((password: string) =>
      Promise.resolve(`$2b$10$hashed_${password}`)
    ),
    verify: vi.fn().mockResolvedValue(true),
  };
}

function createTestUser(overrides?: Partial<{
  email: string;
  isActive: boolean;
}>): User {
  const email = createEmail(overrides?.email ?? 'test@example.com');
  const passwordHash = createPasswordHash('$2b$10$validhashvalue');

  const user = User.fromPersistence({
    id: '550e8400-e29b-41d4-a716-446655440000' as any,
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

  return user;
}

// ============================================================================
// Tests
// ============================================================================

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: UserRepository;
  let mockSessionRepo: SessionRepository;
  let mockPasswordHasher: PasswordHasherPort;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockSessionRepo = createMockSessionRepository();
    mockPasswordHasher = createMockPasswordHasher();

    const deps: LoginDeps = {
      userRepository: mockUserRepo,
      sessionRepository: mockSessionRepo,
      passwordHasher: mockPasswordHasher,
    };

    useCase = new LoginUseCase(deps);
  });

  const validInput = {
    email: 'test@example.com',
    password: 'ValidPassword123',
  };

  describe('successful login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      expect(result.userId).toBe(user.id);
      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(result.sessionToken).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should create and save a session', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockSessionRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should update lastLoginAt on the user', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      expect(user.lastLoginAt).not.toBeNull();
    });

    it('should find user by email', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        createEmail('test@example.com')
      );
    });

    it('should verify password against stored hash', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute(validInput);

      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
        'ValidPassword123',
        user.passwordHash
      );
    });

    it('should normalize email to lowercase', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute({
        ...validInput,
        email: 'TEST@EXAMPLE.COM',
      });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        createEmail('test@example.com')
      );
    });

    it('should set default session duration (24 hours)', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      const expectedExpiry = Date.now() + SESSION_DURATIONS.DEFAULT;
      const actualExpiry = result.expiresAt.getTime();
      // Allow 5 second variance for test execution time
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 5000);
      expect(actualExpiry).toBeLessThan(expectedExpiry + 5000);
    });

    it('should set extended session duration when rememberMe is true', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      const result = await useCase.execute({
        ...validInput,
        rememberMe: true,
      });

      const expectedExpiry = Date.now() + SESSION_DURATIONS.EXTENDED;
      const actualExpiry = result.expiresAt.getTime();
      // Allow 5 second variance for test execution time
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 5000);
      expect(actualExpiry).toBeLessThan(expectedExpiry + 5000);
    });

    it('should store userAgent and ipAddress in session', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await useCase.execute({
        ...validInput,
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      });

      expect(mockSessionRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('authentication failures', () => {
    it('should throw InvalidCredentialsError when user not found', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        InvalidCredentialsError
      );
      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      const user = createTestUser();
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);
      vi.mocked(mockPasswordHasher.verify).mockResolvedValue(false);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it('should not create session when credentials are invalid', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected error
      }

      expect(mockSessionRepo.save).not.toHaveBeenCalled();
    });

    it('should not update lastLoginAt when credentials are invalid', async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected error
      }

      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('account status', () => {
    it('should throw AccountDeactivatedError when user is deactivated', async () => {
      const user = createTestUser({ isActive: false });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        AccountDeactivatedError
      );
      await expect(useCase.execute(validInput)).rejects.toThrow(
        'This account has been deactivated'
      );
    });

    it('should not verify password for deactivated account', async () => {
      const user = createTestUser({ isActive: false });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected error
      }

      expect(mockPasswordHasher.verify).not.toHaveBeenCalled();
    });
  });

  describe('email format validation', () => {
    it('should throw for invalid email format', async () => {
      await expect(
        useCase.execute({ ...validInput, email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });
  });
});
