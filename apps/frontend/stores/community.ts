import { defineStore } from 'pinia';
import type { Community } from '../../../contracts/api/community-structure/community.contract';
import type { CommunitySummary } from '../../../contracts/api/community-structure/community.contract';

/**
 * Community store — UI state only (ADR-007).
 * Holds the currently-viewed community and the user's community list.
 * No business logic; mutations are simple setters driven by composables.
 */
export const useCommunityStore = defineStore('community', {
  state: () => ({
    currentCommunity: null as Community | null,
    communities: [] as CommunitySummary[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    setCurrentCommunity(community: Community | null) {
      this.currentCommunity = community;
    },

    setCommunities(list: CommunitySummary[]) {
      this.communities = list;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    reset() {
      this.currentCommunity = null;
      this.communities = [];
      this.loading = false;
      this.error = null;
    },
  },
});
