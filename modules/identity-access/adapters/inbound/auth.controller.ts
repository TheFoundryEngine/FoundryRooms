/**
 * Auth Controller
 *
 * HTTP endpoints for authentication operations:
 * - POST /auth/register - Register a new user
 * - POST /auth/login - Login with email/password
 * - POST /auth/logout - Logout (requires auth)
 */

import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Inject,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import {
  RegisterUserDto,
  RegisterUserResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  type ActorContext,
} from './dto';
import { AuthGuard, Actor } from './auth.middleware';
import type { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import type { LoginUseCase } from '../../application/use-cases/login.use-case';
import type { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import {
  EmailAlreadyExistsError,
  InvalidPasswordError,
} from '../../application/use-cases/register-user.use-case';
import {
  InvalidCredentialsError,
  AccountDeactivatedError,
} from '../../application/use-cases/login.use-case';

// Import Zod schemas from contracts for validation
import {
  CreateUserRequest,
  LoginRequest,
} from '../../../../contracts/api/identity-access';

// ============================================================================
// Injection Tokens
// ============================================================================

export const REGISTER_USER_USE_CASE = Symbol('REGISTER_USER_USE_CASE');
export const LOGIN_USE_CASE = Symbol('LOGIN_USE_CASE');
export const LOGOUT_USE_CASE = Symbol('LOGOUT_USE_CASE');

// ============================================================================
// Constants
// ============================================================================

const SESSION_COOKIE_NAME = 'fr_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// ============================================================================
// Controller
// ============================================================================

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(REGISTER_USER_USE_CASE)
    private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  /**
   * POST /auth/register
   *
   * Register a new user account.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserDto): Promise<RegisterUserResponseDto> {
    // Validate request body with Zod schema
    const validation = CreateUserRequest.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new BadRequestException(errors.join('; '));
    }

    try {
      const result = await this.registerUserUseCase.execute({
        email: validation.data.email,
        password: validation.data.password,
        displayName: validation.data.displayName,
      });

      return RegisterUserResponseDto.fromOutput(result);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof InvalidPasswordError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /auth/login
   *
   * Login with email and password.
   * Sets a session cookie on success.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    // Validate request body with Zod schema
    const validation = LoginRequest.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new BadRequestException(errors.join('; '));
    }

    try {
      const result = await this.loginUseCase.execute({
        email: validation.data.email,
        password: validation.data.password,
        rememberMe: body.rememberMe,
      });

      // Set session cookie
      const maxAge = result.expiresAt.getTime() - Date.now();
      res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge,
      });

      return LoginResponseDto.fromOutput(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (error instanceof AccountDeactivatedError) {
        throw new UnauthorizedException('Account has been deactivated');
      }
      throw error;
    }
  }

  /**
   * POST /auth/logout
   *
   * Logout the current session.
   * Requires authentication.
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Actor() actor: ActorContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    // Clear session cookie
    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);

    // If we have a session token, invalidate it
    if (actor.sessionToken) {
      const result = await this.logoutUseCase.execute({
        sessionToken: actor.sessionToken,
      });
      return LogoutResponseDto.fromOutput(result);
    }

    // For API key auth, just return success (no session to invalidate)
    return LogoutResponseDto.fromOutput({ success: true });
  }
}
