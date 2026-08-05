import { useAuthStore } from '~/stores/auth';
import { authApi } from '~/services/api/auth';
import type {
  LoginResponse,
  RegisterResponse,
} from '../../../contracts/api/identity-access/auth.contract';

/**
 * useAuth — auth orchestration composable (ADR-007).
 *
 * Wraps the `services/api/auth` functions and synchronizes reactive UI
 * state in the auth store. Components/pages consume this composable; they
 * never call the API layer or `$fetch` directly.
 *
 * SSR-safe: no browser-only APIs are touched here.
 */
export function useAuth() {
  const store = useAuthStore();

  async function login(email: string, password: string): Promise<LoginResponse> {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await authApi.login({ email, password });
      store.setUser(res.actor);
      store.setToken(res.token);
      return res;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      store.setError({ code: e?.code ?? 'UNKNOWN', message: e?.message ?? 'Login failed' });
      throw err;
    } finally {
      store.setLoading(false);
    }
  }

  async function register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<RegisterResponse> {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await authApi.register({ email, password, displayName });
      store.setUser(res.actor);
      store.setToken(res.token);
      return res;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      store.setError({ code: e?.code ?? 'UNKNOWN', message: e?.message ?? 'Registration failed' });
      throw err;
    } finally {
      store.setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    store.setLoading(true);
    try {
      await authApi.logout();
    } finally {
      store.reset();
      store.setLoading(false);
    }
  }

  async function refresh(): Promise<LoginResponse> {
    store.setLoading(true);
    try {
      const res = await authApi.refresh();
      store.setUser(res.actor);
      store.setToken(res.token);
      return res;
    } catch (err: unknown) {
      store.reset();
      throw err;
    } finally {
      store.setLoading(false);
    }
  }

  return {
    store,
    login,
    register,
    logout,
    refresh,
  };
}
