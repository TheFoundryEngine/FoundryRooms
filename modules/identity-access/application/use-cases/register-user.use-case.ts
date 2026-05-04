/**
 * Register User Use Case
 *
 * Handles user registration with email uniqueness validation,
 * password hashing, and domain event emission.
 */

import { User, createEmail } from '../../domain';
import type { Email, ActorId } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { EventEmitterPort, DomainEvent } from '../ports/event-emitter.port';
import { randomUUID } from 'crypto';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface RegisterUserOutput {
  userId: ActorId;
  email: Email;
  displayName: string;
}

// ============================================================================
// Errors
// ============================================================================

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

// ============================================================================
// Use Case
// ============================================================================

export interface RegisterUserDeps {
  userRepository: UserRepository;
  passwordHasher: PasswordHasherPort;
  eventEmitter: EventEmitterPort;
}

export class RegisterUserUseCase {
  private readonly userRepository: UserRepository;
  private readonly passwordHasher: PasswordHasherPort;
  private readonly eventEmitter: EventEmitterPort;

  constructor(deps: RegisterUserDeps) {
    this.userRepository = deps.userRepository;
    this.passwordHasher = deps.passwordHasher;
    this.eventEmitter = deps.eventEmitter;
  }

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validate password requirements
    this.validatePassword(input.password);

    // Create email value object (validates format)
    const email = createEmail(input.email);

    // Check email uniqueness
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsError(input.email);
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Create user entity
    const user = User.create({
      displayName: input.displayName,
      email: input.email,
      passwordHash,
      avatarUrl: input.avatarUrl,
      emailVerified: false,
    });

    // Save user
    await this.userRepository.save(user);

    // Emit domain event
    const event = this.createUserRegisteredEvent(user);
    await this.eventEmitter.emit(event);

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new InvalidPasswordError('Password must be at least 8 characters');
    }
    if (password.length > 128) {
      throw new InvalidPasswordError('Password must not exceed 128 characters');
    }
  }

  private createUserRegisteredEvent(user: User): DomainEvent {
    return {
      id: randomUUID(),
      type: 'identity.user.registered',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      aggregateType: 'user',
      actorId: user.id,
      payload: {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      },
    };
  }
}
