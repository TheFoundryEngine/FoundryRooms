/**
 * Request Authenticator (THE-68 / #29, THE-67 / #28, THE-69 / #30)
 *
 * Single home for credential resolution, shared by AuthMiddleware and
 * AuthGuard — previously each carried a verbatim copy of the extraction
 * and lookup logic (~80 duplicated lines), so every auth fix had to be
 * applied twice.
 *
 * Contract:
 * - `authenticate(req)` returns an ActorContext when a presented credential
 *   is valid, or null when no credential is presented or it is invalid.
 * - Infrastructure failures (repository/database errors) are NOT part of
 *   that spectrum: they throw AuthenticationInfrastructureError so callers
 *   can distinguish "you are not logged in" from "the platform cannot
 *   check right now". Swallowing them silently downgraded every user to
 *   anonymous during a database outage, presenting a 5xx-class incident
 *   as a wave of 401s.
 */

import { Injectable, Inject } from '@nestjs/common';
import type { Request } from 'express';
import type { ActorContext } from './dto';
import type { SessionRepository } from '../../application/ports/session.repository';
import type { AgentRepository } from '../../application/ports/agent.repository';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port';
import type { ApiKey, Session } from '../../domain';
import { createSessionToken } from '../../domain';

// ============================================================================
// Injection Tokens
// ============================================================================

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
export const AGENT_REPOSITORY = Symbol('AGENT_REPOSITORY');
export const API_KEY_GENERATOR = Symbol('API_KEY_GENERATOR');

// ============================================================================
// Constants
// ============================================================================

const SESSION_COOKIE_NAME = 'fr_session';
const AUTH_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';

/**
 * How stale lastAccessedAt may get before a request refreshes it.
 * Previously every authenticated request wrote to the sessions table
 * (THE-69 / #30) — a write per request on Neon free tier, buying a
 * timestamp nothing currently reads. One write per window is plenty for
 * any future idle-expiry policy.
 */
export const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

// ============================================================================
// Errors
// ============================================================================

/**
 * A repository/database failure during authentication. Deliberately NOT an
 * HttpException: the transport decision (503, log-and-continue, …) belongs
 * to the caller. The message never contains credential material.
 */
export class AuthenticationInfrastructureError extends Error {
  constructor(
    stage: 'session-lookup' | 'agent-lookup',
    public readonly cause: unknown,
  ) {
    super(`Authentication infrastructure failure during ${stage}`);
    this.name = 'AuthenticationInfrastructureError';
  }
}

// ============================================================================
// Authenticator
// ============================================================================

@Injectable()
export class RequestAuthenticator {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(AGENT_REPOSITORY)
    private readonly agentRepository: AgentRepository,
    @Inject(API_KEY_GENERATOR)
    private readonly apiKeyGenerator: ApiKeyGeneratorPort,
  ) {}

  /**
   * Resolve the request's credential to an actor.
   * Session cookie is tried first, then the Bearer API key.
   *
   * @returns ActorContext for a valid credential, null for absent/invalid.
   * @throws AuthenticationInfrastructureError when a lookup fails for
   *         infrastructure reasons — never masked as "unauthenticated".
   */
  async authenticate(req: Request): Promise<ActorContext | null> {
    const sessionToken = this.extractSessionToken(req);
    if (sessionToken) {
      const context = await this.authenticateSession(sessionToken);
      if (context) {
        return context;
      }
    }

    const apiKey = this.extractApiKey(req);
    if (apiKey) {
      const context = await this.authenticateApiKey(apiKey);
      if (context) {
        return context;
      }
    }

    return null;
  }

  private extractSessionToken(req: Request): string | null {
    const cookies = req.cookies as Record<string, string> | undefined;
    return cookies?.[SESSION_COOKIE_NAME] ?? null;
  }

  private extractApiKey(req: Request): string | null {
    const authHeader = req.headers[AUTH_HEADER];
    if (typeof authHeader !== 'string') {
      return null;
    }
    if (!authHeader.startsWith(BEARER_PREFIX)) {
      return null;
    }
    return authHeader.slice(BEARER_PREFIX.length);
  }

  private async authenticateSession(token: string): Promise<ActorContext | null> {
    let session: Session | null;
    try {
      session = await this.sessionRepository.findByToken(token);
    } catch (cause) {
      throw new AuthenticationInfrastructureError('session-lookup', cause);
    }

    if (!session || session.isExpired()) {
      return null;
    }

    await this.touchSessionIfStale(session);

    return {
      actorId: session.actorId,
      actorType: session.actorType,
      sessionToken: createSessionToken(token),
    };
  }

  /**
   * Refresh lastAccessedAt at most once per TOUCH_INTERVAL_MS.
   * A failed touch write never fails authentication — the session was
   * already read successfully; losing a bookkeeping timestamp is not a
   * reason to reject the request. It is not silent either: the caller's
   * logger sees it via console (kept dependency-free on purpose).
   */
  private async touchSessionIfStale(session: Session): Promise<void> {
    const last = session.lastAccessedAt?.getTime() ?? 0;
    if (Date.now() - last < TOUCH_INTERVAL_MS) {
      return;
    }
    session.touch();
    try {
      await this.sessionRepository.save(session);
    } catch (cause) {
      console.error('session touch write failed (auth unaffected):', cause);
    }
  }

  private async authenticateApiKey(key: string): Promise<ActorContext | null> {
    if (!this.apiKeyGenerator.isValid(key)) {
      return null;
    }

    const prefix = this.apiKeyGenerator.extractPrefix(key);

    let agent;
    try {
      agent = await this.agentRepository.findByApiKeyPrefix(prefix);
    } catch (cause) {
      throw new AuthenticationInfrastructureError('agent-lookup', cause);
    }
    if (!agent) {
      return null;
    }

    const keyHash = this.apiKeyGenerator.hash(key as ApiKey);
    if (keyHash !== agent.apiKeyHash) {
      return null;
    }

    if (!agent.isActive) {
      return null;
    }

    return {
      actorId: agent.id,
      actorType: 'agent',
    };
  }
}
