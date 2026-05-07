/**
 * Auth Middleware
 *
 * Authenticates requests using either:
 * - Session cookie
 * - Authorization: Bearer <api-key> header
 *
 * Attaches ActorContext to the request for downstream use.
 */

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { ActorContext } from './dto';
import type { SessionRepository } from '../../application/ports/session.repository';
import type { ApiKeyGeneratorPort } from '../../application/ports/api-key-generator.port';
import type { AgentRepository } from '../../application/ports/agent.repository';
import type { ApiKey } from '../../domain';
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

// ============================================================================
// Extended Request Type
// ============================================================================

/**
 * Express Request with attached actor context
 */
export interface AuthenticatedRequest extends Request {
  actor?: ActorContext;
}

// ============================================================================
// Auth Middleware
// ============================================================================

/**
 * Middleware that attempts to authenticate the request.
 * Sets req.actor if authentication succeeds.
 * Does NOT block unauthenticated requests - use AuthGuard for that.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(AGENT_REPOSITORY)
    private readonly agentRepository: AgentRepository,
    @Inject(API_KEY_GENERATOR)
    private readonly apiKeyGenerator: ApiKeyGeneratorPort,
  ) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
      // Try session cookie first
      const sessionToken = this.extractSessionToken(req);
      if (sessionToken) {
        const context = await this.authenticateSession(sessionToken);
        if (context) {
          req.actor = context;
          return next();
        }
      }

      // Try API key header
      const apiKey = this.extractApiKey(req);
      if (apiKey) {
        const context = await this.authenticateApiKey(apiKey);
        if (context) {
          req.actor = context;
          return next();
        }
      }

      // No authentication provided or invalid
      next();
    } catch {
      // Continue without authentication on error
      next();
    }
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
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      return null;
    }

    // Check expiration
    if (session.isExpired()) {
      return null;
    }

    // Update last accessed
    session.touch();
    await this.sessionRepository.save(session);

    return {
      actorId: session.actorId,
      actorType: session.actorType,
      sessionToken: createSessionToken(token),
    };
  }

  private async authenticateApiKey(key: string): Promise<ActorContext | null> {
    // Validate format
    if (!this.apiKeyGenerator.isValid(key)) {
      return null;
    }

    // Extract prefix for lookup
    const prefix = this.apiKeyGenerator.extractPrefix(key);

    // Find agent by prefix
    const agent = await this.agentRepository.findByApiKeyPrefix(prefix);
    if (!agent) {
      return null;
    }

    // Verify full hash
    const keyHash = this.apiKeyGenerator.hash(key as ApiKey);
    if (keyHash !== agent.apiKeyHash) {
      return null;
    }

    // Check if active
    if (!agent.isActive) {
      return null;
    }

    return {
      actorId: agent.id,
      actorType: 'agent',
    };
  }
}

// ============================================================================
// Auth Guard
// ============================================================================

/**
 * Guard that requires authentication.
 * Should be used on routes that need a logged-in user/agent.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(AGENT_REPOSITORY)
    private readonly agentRepository: AgentRepository,
    @Inject(API_KEY_GENERATOR)
    private readonly apiKeyGenerator: ApiKeyGeneratorPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // If already authenticated by middleware
    if (request.actor) {
      return true;
    }

    // Try session cookie
    const sessionToken = this.extractSessionToken(request);
    if (sessionToken) {
      const actorContext = await this.authenticateSession(sessionToken);
      if (actorContext) {
        request.actor = actorContext;
        return true;
      }
    }

    // Try API key
    const apiKey = this.extractApiKey(request);
    if (apiKey) {
      const actorContext = await this.authenticateApiKey(apiKey);
      if (actorContext) {
        request.actor = actorContext;
        return true;
      }
    }

    throw new UnauthorizedException('Authentication required');
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
    const session = await this.sessionRepository.findByToken(token);
    if (!session || session.isExpired()) {
      return null;
    }

    session.touch();
    await this.sessionRepository.save(session);

    return {
      actorId: session.actorId,
      actorType: session.actorType,
      sessionToken: createSessionToken(token),
    };
  }

  private async authenticateApiKey(key: string): Promise<ActorContext | null> {
    if (!this.apiKeyGenerator.isValid(key)) {
      return null;
    }

    const prefix = this.apiKeyGenerator.extractPrefix(key);
    const agent = await this.agentRepository.findByApiKeyPrefix(prefix);
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

// ============================================================================
// Decorator for getting ActorContext
// ============================================================================

import { createParamDecorator } from '@nestjs/common';

/**
 * Parameter decorator to inject the authenticated actor context
 * Usage: @Actor() actor: ActorContext
 */
export const Actor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActorContext | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.actor;
  },
);
