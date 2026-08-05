/**
 * Realtime transport plugin (client-only).
 *
 * Per ADR-007, realtime connections initialize post-hydration only. This
 * plugin runs exclusively on the client after hydration completes.
 *
 * TODO: initialize the websocket/realtime transport and bind to Pinia stores
 * once the realtime API is available.
 */
export default defineNuxtPlugin(() => {
  // No-op placeholder. Realtime connections must be established here, never
  // during SSR.
});
