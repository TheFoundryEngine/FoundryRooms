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

// Registration schemas
export const RegisterRequest = z.object({
  email: Email,
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  token: SessionToken,
  actor: ActorSummary,
  expiresAt: z.string().datetime(),
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

// Password Reset schemas
export const PasswordResetRequestSchema = z.object({
  email: Email,
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetResponse = z.object({
  message: z.string(),
});
export type PasswordResetResponse = z.infer<typeof PasswordResetResponse>;

export const PasswordResetConfirmRequest = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
export type PasswordResetConfirmRequest = z.infer<typeof PasswordResetConfirmRequest>;

export const PasswordResetConfirmResponse = z.object({
  message: z.string(),
});
export type PasswordResetConfirmResponse = z.infer<typeof PasswordResetConfirmResponse>;

// Logout response
export const LogoutResponse = z.object({
  message: z.string(),
});
export type LogoutResponse = z.infer<typeof LogoutResponse>;
