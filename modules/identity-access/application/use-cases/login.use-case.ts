/**
 * Login Use Case
 *
 * Handles user authentication by email and password,
 * creates a session, and updates last login timestamp.
 */

import { Session, createExpirationDate, SESSION_DURATIONS, createEmail } from '../../domain';
import type { Email, ActorId, SessionToken } from '../../domain';
import type { UserRepository } from '../ports/user.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface LoginOutput {
  sessionToken: SessionToken;
  userId: ActorId;
  displayName: string;
  email: Email;
  expiresAt: Date;
}

// ============================================================================
// Errors
// ============================================================================

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountDeactivatedError extends Error {
  constructor() {
    super('This account has been deactivated');
    this.name = 'AccountDeactivatedError';
  }
}

// ============================================================================
// Use Case
// ============================================================================

export interface LoginDeps {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  passwordHasher: PasswordHasherPort;
}

export class LoginUseCase {
  private readonly userRepository: UserRepository;
  private readonly sessionRepository: SessionRepository;
  private readonly passwordHasher: PasswordHasherPort;

  constructor(deps: LoginDeps) {
    this.userRepository = deps.userRepository;
    this.sessionRepository = deps.sessionRepository;
    this.passwordHasher = deps.passwordHasher;
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Validate and create email value object
    const email = createEmail(input.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AccountDeactivatedError();
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Determine session duration
    const duration = input.rememberMe
      ? SESSION_DURATIONS.EXTENDED
      : SESSION_DURATIONS.DEFAULT;
    const expiresAt = createExpirationDate(duration);

    // Create session
    const { session, token } = Session.create({
      actorId: user.id,
      actorType: 'user',
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    // Save session
    await this.sessionRepository.save(session);

    // Update user's last login timestamp
    user.recordLogin();
    await this.userRepository.save(user);

    return {
      sessionToken: token,
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      expiresAt,
    };
  }
}
