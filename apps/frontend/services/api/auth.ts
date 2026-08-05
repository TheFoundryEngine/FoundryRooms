import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
} from '../../../../contracts/api/identity-access/auth.contract';
import type { ActorSummary } from '../../../../contracts/api/identity-access/actor.contract';
import { apiClient } from './client';

/**
 * Auth API functions.
 *
 * All request/response shapes are imported from the shared `contracts/` package
 * (identity-access bounded context). Types are never redefined here.
 */
export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  logout(): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>('/auth/logout');
  },

  refresh(): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/refresh');
  },

  me(): Promise<ActorSummary> {
    return apiClient.get<ActorSummary>('/auth/me');
  },

  requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    return apiClient.post<PasswordResetResponse>('/auth/password-reset', data);
  },

  confirmPasswordReset(
    data: PasswordResetConfirmRequest,
  ): Promise<PasswordResetConfirmResponse> {
    return apiClient.post<PasswordResetConfirmResponse>('/auth/password-reset/confirm', data);
  },
};
