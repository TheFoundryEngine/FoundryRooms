import { defineStore } from 'pinia';

export type Theme = 'light' | 'dark';

/**
 * Theme store — UI state only (ADR-007).
 * Persists to `localStorage`. All browser-only API access is guarded with
 * `import.meta.client` so the store is SSR-safe.
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as Theme,
  }),

  actions: {
    setTheme(theme: Theme) {
      this.theme = theme;
      this.persist();
    },

    toggle() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.persist();
    },

    /** Restore theme from localStorage. Must only run on the client. */
    hydrate() {
      if (import.meta.client) {
        const stored = localStorage.getItem('foundry-theme');
        if (stored === 'light' || stored === 'dark') {
          this.theme = stored;
        }
      }
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem('foundry-theme', this.theme);
      }
    },
  },
});
