/**
 * Theme hydration plugin (client-only).
 *
 * Runs post-hydration to restore the persisted theme from localStorage.
 * Browser-only API access is safe here because `.client` plugins only run
 * in the browser.
 */
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore();
  themeStore.hydrate();
});
