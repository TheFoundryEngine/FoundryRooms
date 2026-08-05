/**
 * Refresh Session Use Case
 *
 * Handles session token rotation. Given a valid (non-expired) session token,
 * creates a new session and deletes the old one, returning the new token.
 * This implements session rotation to limit token replay windows.
 */

import {
  Session,
  createExpirationDate,
  SESSION_DURATIONS,
} from '../../domain';
import type { ActorId, ActorType, SessionToken } from '../../domain';
import type { SessionRepository } from '../ports/session.repository';

// ============================================================================
// Input/Output DTOs
// ============================================================================

export interface RefreshSessionInput {
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface RefreshSessionOutput {
  sessionToken: SessionToken;
  actorId: ActorId;
  actorType: ActorType;
  expiresAt: Date;
}

export type RefreshToken = string;

// ============================================================================
// Errors
// ============================================================================

export class SessionNotFoundError extends Error {
  constructor() {
    super('Session not found');
    this.name = 'SessionNotFoundError';
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session has expired');
    this.name = 'SessionExpiredError';
  }
}

// ============================================================================
// Use Case
// ============================================================================

export interface RefreshSessionDeps {
  sessionRepository: SessionRepository;
}

export class RefreshSessionUseCase {
  private readonly sessionRepository: SessionRepository;

  constructor(deps: RefreshSessionDeps) {
    this.sessionRepository = deps.sessionRepository;
  }

  async execute(refreshToken: string, opts?: { userAgent?: string | null; ipAddress?: string | null }): Promise<RefreshSessionOutput> {
    // Look up the existing session by token
    const session = await this.sessionRepository.findByToken(refreshToken);
    if (!session) {
      throw new SessionNotFoundError();
    }

    // Validate session is not expired
    if (session.isExpired()) {
      throw new SessionExpiredError();
    }

    // Determine session duration (preserve remaining duration or use default)
    const duration = SESSION_DURATIONS.DEFAULT;
    const expiresAt = createExpirationDate(duration);

    // Delete the old session first (rotation invalidates old token)
    await this.sessionRepository.deleteByToken(refreshToken);

    // Create a new session for the same actor
    const { session: newSession, token } = Session.create({
      actorId: session.actorId,
      actorType: session.actorType,
      expiresAt,
      userAgent: opts?.userAgent ?? session.userAgent,
      ipAddress: opts?.ipAddress ?? session.ipAddress,
    });

    // Save the new session
    await this.sessionRepository.save(newSession);

    return {
      sessionToken: token,
      actorId: newSession.actorId,
      actorType: newSession.actorType,
      expiresAt,
    };
  }
}
