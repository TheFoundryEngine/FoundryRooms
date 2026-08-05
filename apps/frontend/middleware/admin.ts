import { useAuthStore } from '~/stores/auth';

/**
 * admin middleware — verifies the current user has an admin role before
 * rendering admin routes.
 *
 * Placeholder: real role check will call the identity-access API via
 * `services/api/` once available. For now it only ensures a user is present.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  // Placeholder admin role check — replace with API-backed role verification.
  // e.g. await authApi.hasRole('system:admin')
});
