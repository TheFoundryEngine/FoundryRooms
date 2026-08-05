import { defineStore } from 'pinia';
import type { ActorSummary } from '../../../contracts/api/identity-access/actor.contract';
import type { AuthErrorCode } from '../../../contracts/api/identity-access/auth.contract';

/**
 * Auth store — UI state only (ADR-007).
 * No business logic lives here; orchestration is handled by composables
 * which call the `services/api/` layer. This store only holds reactive
 * UI state and simple setters.
 */
export interface AuthErrorState {
  code: AuthErrorCode | string;
  message: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as ActorSummary | null,
    token: null as string | null,
    isAuthenticated: false,
    loading: false,
    error: null as AuthErrorState | null,
  }),

  actions: {
    setUser(user: ActorSummary | null) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    setToken(token: string | null) {
      this.token = token;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: AuthErrorState | null) {
      this.error = error;
    },

    reset() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
    },
  },
});
