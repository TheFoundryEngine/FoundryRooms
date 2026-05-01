/**
 * Password Reset Use Cases
 *
 * Handles password reset flow for users:
 * 1. RequestPasswordResetUseCase - Initiates reset by generating a token
 * 2. CompletePasswordResetUseCase - Completes reset by validating token and updating password
 */

import { randomBytes, createHash } from 'crypto';
import { createEmail } from '../../domain';
import type { ActorId } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { ResetTokenRepository } from '../ports/reset-token.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { EventEmitterPort, DomainEvent } from '../ports/event-emitter.port';

// ============================================================================
// Constants
// ============================================================================

/** Reset token expires after 1 hour */
export const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;

/** Minimum password length */
const MIN_PASSWORD_LENGTH = 8;

// ============================================================================
// Token Generation Utilities
// ============================================================================

/**
 * Generates a secure reset token
 * Returns base64url encoded 32 random bytes
 */
export function generateResetToken(): string {
  const bytes = randomBytes(32);
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Hashes a reset token for secure storage
 */
export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a UUID for reset token ID
 */
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Request Password Reset Use Case
// ============================================================================

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetOutput {
  /** Indicates the request was processed (does not reveal if user exists) */
  success: boolean;
}

export class UserNotFoundForResetError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundForResetError';
  }
}

export interface RequestPasswordResetDeps {
  userRepository: UserRepository;
  resetTokenRepository: ResetTokenRepository;
  eventEmitter: EventEmitterPort;
}

/**
 * Use case for requesting a password reset.
 *
 * This initiates the password reset flow by:
 * 1. Finding the user by email
 * 2. Generating a secure reset token
 * 3. Storing the token (hashed)
 * 4. Emitting a PasswordResetRequested event (which triggers email sending)
 *
 * Note: For security, the public response does not reveal whether the user exists.
 * The actual user check happens internally.
 */
export class RequestPasswordResetUseCase {
  private readonly userRepository: UserRepository;
  private readonly resetTokenRepository: ResetTokenRepository;
  private readonly eventEmitter: EventEmitterPort;

  constructor(deps: RequestPasswordResetDeps) {
    this.userRepository = deps.userRepository;
    this.resetTokenRepository = deps.resetTokenRepository;
    this.eventEmitter = deps.eventEmitter;
  }

  async execute(input: RequestPasswordResetInput): Promise<RequestPasswordResetOutput> {
    // Validate and normalize email
    const email = createEmail(input.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    // For security, we don't reveal if user exists to the caller
    // But internally we only proceed if user exists
    if (!user) {
      // Return success anyway to prevent email enumeration
      return { success: true };
    }

    // Check if user is active
    if (!user.isActive) {
      // For deactivated accounts, also return success to prevent enumeration
      return { success: true };
    }

    // Invalidate any existing tokens for this user
    await this.resetTokenRepository.invalidateAllForUser(user.id);

    // Generate secure reset token
    const token = generateResetToken();
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

    // Store the token (hashed)
    await this.resetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Emit event for email sending (handler not in scope)
    const event: DomainEvent = {
      id: generateUuid(),
      type: 'identity.user.password_reset_requested',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      aggregateType: 'user',
      actorId: user.id,
      payload: {
        userId: user.id,
        email: user.email,
        token, // Plaintext token for email
        expiresAt: expiresAt.toISOString(),
      },
    };

    await this.eventEmitter.emit(event);

    return { success: true };
  }

  /**
   * Internal method that throws if user not found.
   * Useful for testing or admin contexts where you need to know if user exists.
   */
  async executeWithValidation(input: RequestPasswordResetInput): Promise<{ token: string; expiresAt: Date }> {
    const email = createEmail(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundForResetError();
    }

    if (!user.isActive) {
      throw new AccountDeactivatedForResetError();
    }

    // Invalidate any existing tokens
    await this.resetTokenRepository.invalidateAllForUser(user.id);

    // Generate secure reset token
    const token = generateResetToken();
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

    // Store the token
    await this.resetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Emit event
    const event: DomainEvent = {
      id: generateUuid(),
      type: 'identity.user.password_reset_requested',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      aggregateType: 'user',
      actorId: user.id,
      payload: {
        userId: user.id,
        email: user.email,
        token,
        expiresAt: expiresAt.toISOString(),
      },
    };

    await this.eventEmitter.emit(event);

    return { token, expiresAt };
  }
}

// ============================================================================
// Complete Password Reset Use Case
// ============================================================================

export interface CompletePasswordResetInput {
  token: string;
  newPassword: string;
}

export interface CompletePasswordResetOutput {
  success: boolean;
  userId: ActorId;
}

export class InvalidResetTokenError extends Error {
  constructor(message: string = 'Invalid or expired reset token') {
    super(message);
    this.name = 'InvalidResetTokenError';
  }
}

export class ResetTokenExpiredError extends Error {
  constructor() {
    super('Reset token has expired');
    this.name = 'ResetTokenExpiredError';
  }
}

export class ResetTokenAlreadyUsedError extends Error {
  constructor() {
    super('Reset token has already been used');
    this.name = 'ResetTokenAlreadyUsedError';
  }
}

export class AccountDeactivatedForResetError extends Error {
  constructor() {
    super('Account is deactivated');
    this.name = 'AccountDeactivatedForResetError';
  }
}

export class WeakPasswordError extends Error {
  constructor(message: string = 'Password does not meet requirements') {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

export interface CompletePasswordResetDeps {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  resetTokenRepository: ResetTokenRepository;
  passwordHasher: PasswordHasherPort;
}

/**
 * Use case for completing a password reset.
 *
 * This completes the password reset flow by:
 * 1. Validating the reset token (not expired, not used)
 * 2. Validating the new password meets requirements
 * 3. Updating the user's password
 * 4. Invalidating all existing sessions (security measure)
 * 5. Marking the token as used
 */
export class CompletePasswordResetUseCase {
  private readonly userRepository: UserRepository;
  private readonly sessionRepository: SessionRepository;
  private readonly resetTokenRepository: ResetTokenRepository;
  private readonly passwordHasher: PasswordHasherPort;

  constructor(deps: CompletePasswordResetDeps) {
    this.userRepository = deps.userRepository;
    this.sessionRepository = deps.sessionRepository;
    this.resetTokenRepository = deps.resetTokenRepository;
    this.passwordHasher = deps.passwordHasher;
  }

  async execute(input: CompletePasswordResetInput): Promise<CompletePasswordResetOutput> {
    // Validate password requirements
    this.validatePassword(input.newPassword);

    // Hash the token to look it up
    const tokenHash = hashResetToken(input.token);

    // Find the token
    const resetToken = await this.resetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new InvalidResetTokenError();
    }

    // Check if token is already used
    if (resetToken.usedAt !== null) {
      throw new ResetTokenAlreadyUsedError();
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      throw new ResetTokenExpiredError();
    }

    // Find the user
    const user = await this.userRepository.findById(resetToken.userId);

    if (!user) {
      throw new InvalidResetTokenError('User no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AccountDeactivatedForResetError();
    }

    // Hash the new password
    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);

    // Update user's password
    user.updatePassword(newPasswordHash);
    await this.userRepository.save(user);

    // Invalidate all existing sessions for security
    await this.sessionRepository.deleteByActorId(user.id);

    // Mark the token as used
    await this.resetTokenRepository.markAsUsed(tokenHash);

    // Invalidate any other pending reset tokens for this user
    await this.resetTokenRepository.invalidateAllForUser(user.id);

    return {
      success: true,
      userId: user.id,
    };
  }

  /**
   * Validates password meets minimum requirements
   */
  private validatePassword(password: string): void {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new WeakPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    // Could add more validation here (uppercase, numbers, symbols, etc.)
  }
}
