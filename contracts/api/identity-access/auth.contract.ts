import { z } from 'zod';
import { Email } from './user.contract';
import { SessionToken } from './session.contract';
import { ActorSummary } from './actor.contract';

export const LoginRequest = z.object({
  email: Email,
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  token: SessionToken,
  actor: ActorSummary,
  expiresAt: z.string().datetime(),
});
export type LoginResponse = z.infer<typeof LoginResponse>;

export const LogoutRequest = z.object({});
export type LogoutRequest = z.infer<typeof LogoutRequest>;

export const AuthErrorCode = z.enum([
  'INVALID_CREDENTIALS',
  'ACCOUNT_DISABLED',
  'SESSION_EXPIRED',
  'UNAUTHORIZED',
]);
export type AuthErrorCode = z.infer<typeof AuthErrorCode>;

export const AuthError = z.object({
  code: AuthErrorCode,
  message: z.string(),
});
export type AuthError = z.infer<typeof AuthError>;
