/**
 * Auth Middleware and Guard
 *
 * Both delegate credential resolution to RequestAuthenticator (THE-68 /
 * #29 removed the duplicated ~80-line copies each used to carry).
 *
 * - AuthMiddleware attaches ActorContext to the request when a credential
 *   resolves; it never blocks. Enforcement is the guard's job.
 * - AuthGuard requires an authenticated actor; absent/invalid credentials
 *   are 401, infrastructure failures are 503 (THE-67 / #28) — a database
 *   outage must not present as "everyone got logged out".
 */

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ServiceUnavailableException,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import type { Response, NextFunction } from 'express';
import type { Request } from 'express';
import type { ActorContext } from './dto';
import {
  RequestAuthenticator,
  AuthenticationInfrastructureError,
} from './request-authenticator';

// Injection tokens live with the authenticator now; re-exported so existing
// imports (app.module, adapters/inbound/index) keep working unchanged.
export {
  SESSION_REPOSITORY,
  AGENT_REPOSITORY,
  API_KEY_GENERATOR,
} from './request-authenticator';

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
 *
 * Infrastructure failures are logged and the request continues without an
 * actor — by design, because this middleware runs on every route including
 * public ones, and enforcement belongs to AuthGuard (which turns the same
 * failure into a 503). What changed vs. the original: the failure is no
 * longer swallowed silently (THE-67 / #28).
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly authenticator: RequestAuthenticator) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
      const context = await this.authenticator.authenticate(req);
      if (context) {
        req.actor = context;
      }
    } catch (error) {
      if (error instanceof AuthenticationInfrastructureError) {
        // Log loudly (no credential material in the message), continue
        // unauthenticated; guarded routes will 503 in AuthGuard.
        this.logger.error(error.message, (error.cause as Error)?.stack);
      } else {
        this.logger.error('Unexpected error during authentication', (error as Error)?.stack);
      }
    }
    next();
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
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authenticator: RequestAuthenticator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // If already authenticated by middleware
    if (request.actor) {
      return true;
    }

    let actorContext: ActorContext | null;
    try {
      actorContext = await this.authenticator.authenticate(request);
    } catch (error) {
      if (error instanceof AuthenticationInfrastructureError) {
        // "The platform cannot check your credentials" is not "you are
        // not logged in" — surface it as service unavailability, not 401.
        this.logger.error(error.message, (error.cause as Error)?.stack);
        throw new ServiceUnavailableException('Authentication is temporarily unavailable');
      }
      throw error;
    }

    if (actorContext) {
      request.actor = actorContext;
      return true;
    }

    throw new UnauthorizedException('Authentication required');
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
