import { useAuthStore } from '~/stores/auth';

/**
 * auth middleware — redirects unauthenticated users to the login page.
 * Applied via `definePageMeta({ middleware: 'auth' })` on protected routes.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});
