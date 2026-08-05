import { useCommunityStore } from '~/stores/community';

/**
 * community middleware — verifies community membership before rendering
 * community-scoped routes.
 *
 * Placeholder: real membership check will call the community-structure API
 * via `services/api/` once available. For now it only ensures a current
 * community is present in the store.
 */
export default defineNuxtRouteMiddleware((to) => {
  const community = useCommunityStore();
  const slug = to.params.communitySlug as string | undefined;

  if (!slug) {
    return navigateTo('/');
  }

  // Placeholder membership check — replace with API-backed verification.
  if (!community.currentCommunity || community.currentCommunity.slug !== slug) {
    // In production this would load the community + membership and redirect
    // to a join page on failure. For now we allow rendering.
  }
});
