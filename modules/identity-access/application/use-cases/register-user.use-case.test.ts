import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RegisterUserUseCase,
  EmailAlreadyExistsError,
  InvalidPasswordError,
} from './register-user.use-case';
import type { RegisterUserDeps } from './register-user.use-case';
import { User, createEmail } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { EventEmitterPort, DomainEvent } from '../ports/event-emitter.port';

function createMockUserRepository(): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByType: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockPasswordHasher(): PasswordHasherPort {
  return {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
    verify: vi.fn().mockResolvedValue(true),
  };
}

function createMockEventEmitter(): EventEmitterPort {
  return {
    emit: vi.fn().mockResolvedValue(undefined),
    emitMany: vi.fn().mockResolvedValue(undefined),
  };
}

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepo: UserRepository;
  let mockPasswordHasher: PasswordHasherPort;
  let mockEventEmitter: EventEmitterPort;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockPasswordHasher = createMockPasswordHasher();
    mockEventEmitter = createMockEventEmitter();

    const deps: RegisterUserDeps = {
      userRepository: mockUserRepo,
      passwordHasher: mockPasswordHasher,
      eventEmitter: mockEventEmitter,
    };

    useCase = new RegisterUserUseCase(deps);
  });

  const validInput = {
    email: 'test@example.com',
    password: 'SecurePassword123',
    displayName: 'Test User',
  };

  describe('successful registration', () => {
    it('should register a new user successfully', async () => {
      const result = await useCase.execute(validInput);

      expect(result.email).toBe('test@example.com');
      expect(result.displayName).toBe('Test User');
      expect(result.userId).toBeDefined();
    });

    it('should check email uniqueness', async () => {
      await useCase.execute(validInput);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        createEmail('test@example.com')
      );
    });

    it('should hash the password', async () => {
      await useCase.execute(validInput);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('SecurePassword123');
    });

    it('should save the user to repository', async () => {
      await useCase.execute(validInput);

      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      const saveCalls = (mockUserRepo.save as ReturnType<typeof vi.fn>).mock.calls;
      const firstSaveCall = saveCalls[0];
      expect(firstSaveCall).toBeDefined();
      const savedUser = firstSaveCall![0] as User;
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.displayName).toBe('Test User');
      expect(savedUser.emailVerified).toBe(false);
    });

    it('should emit UserRegistered event', async () => {
      const result = await useCase.execute(validInput);

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      const emitCalls = (mockEventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls;
      const firstEmitCall = emitCalls[0];
      expect(firstEmitCall).toBeDefined();
      const emittedEvent = firstEmitCall![0] as DomainEvent;

      expect(emittedEvent.type).toBe('identity.user.registered');
      expect(emittedEvent.aggregateType).toBe('user');
      expect(emittedEvent.aggregateId).toBe(result.userId);
    });

    it('should normalize email to lowercase', async () => {
      const result = await useCase.execute({
        ...validInput,
        email: 'TEST@EXAMPLE.COM',
      });

      expect(result.email).toBe('test@example.com');
    });
  });

  describe('email uniqueness validation', () => {
    it('should throw EmailAlreadyExistsError if email exists', async () => {
      const existingUser = User.create({
        email: 'test@example.com',
        displayName: 'Existing User',
        passwordHash: '$2b$10$existinghash',
      });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(existingUser);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        EmailAlreadyExistsError
      );
    });

    it('should not save user if email already exists', async () => {
      const existingUser = User.create({
        email: 'test@example.com',
        displayName: 'Existing User',
        passwordHash: '$2b$10$existinghash',
      });
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(existingUser);

      try {
        await useCase.execute(validInput);
      } catch {
        // Expected error
      }

      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('password validation', () => {
    it('should throw InvalidPasswordError for password shorter than 8 chars', async () => {
      await expect(
        useCase.execute({ ...validInput, password: 'short' })
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError for empty password', async () => {
      await expect(
        useCase.execute({ ...validInput, password: '' })
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError for password longer than 128 chars', async () => {
      const longPassword = 'a'.repeat(129);
      await expect(
        useCase.execute({ ...validInput, password: longPassword })
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should accept password exactly 8 characters', async () => {
      await expect(
        useCase.execute({ ...validInput, password: '12345678' })
      ).resolves.toBeDefined();
    });

    it('should accept password exactly 128 characters', async () => {
      const validLongPassword = 'a'.repeat(128);
      await expect(
        useCase.execute({ ...validInput, password: validLongPassword })
      ).resolves.toBeDefined();
    });
  });

  describe('email format validation', () => {
    it('should throw for invalid email format', async () => {
      await expect(
        useCase.execute({ ...validInput, email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw for empty email', async () => {
      await expect(
        useCase.execute({ ...validInput, email: '' })
      ).rejects.toThrow('Invalid email format');
    });
  });
});
