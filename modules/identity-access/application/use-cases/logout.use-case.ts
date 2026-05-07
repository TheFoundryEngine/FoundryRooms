/**
 * Logout Use Case
 *
 * Handles session termination by deleting the session token.
 * Works for any actor type (User or Agent).
 */

import type { SessionRepository } from '../ports/session.repository';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface LogoutInput {
  sessionToken: string;
}

export interface LogoutOutput {
  success: boolean;
}

// ============================================================================
// Use Case
// ============================================================================

export interface LogoutDeps {
  sessionRepository: SessionRepository;
}

export class LogoutUseCase {
  private readonly sessionRepository: SessionRepository;

  constructor(deps: LogoutDeps) {
    this.sessionRepository = deps.sessionRepository;
  }

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    // Delete the session by token
    // This is idempotent - if session doesn't exist, it's already "logged out"
    await this.sessionRepository.deleteByToken(input.sessionToken);

    return {
      success: true,
    };
  }
}
