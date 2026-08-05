# ADR-F-B-001: Frontend Shell and Route Scaffolding

- **Status:** Proposed
- **Date:** 2026-08-05
- **Owners:** Team B lead, paired agent
- **Related:** ADR-002, ADR-004, ADR-007, ADR-010, ADR-012
- **Linear Project:** Team B — Experience ADRs
- **Linear Issue:** [THE-6](https://linear.app/thefoundryengine/issue/THE-6/adr-f-b-001-frontend-shell-and-route-scaffolding)

## Context

Before any feature UI can be built, the frontend application needs a structural shell: routing, layout, API client layer, state management baseline, and SSR-safe rendering. ADR-007 defines the frontend architecture and boundary model. This feature ADR defines the concrete scaffold that all Team B feature work builds on.

The frontend is Nuxt (SSR-capable, TypeScript-first, PWA-friendly per ADR-008). It must consume contracts from `/contracts/` and never make raw API calls from components.

## Decision

### App shell
- **Nuxt 3** as the application framework
- Root layout with: header (nav, user menu), main content slot, footer
- Community-scoped layout for authenticated community pages
- Auth-aware navigation (redirect to login when unauthenticated)

### Route structure
- `/` — landing/home
- `/auth/login`, `/auth/register`, `/auth/reset` — auth flows (Team A contract)
- `/c/[communitySlug]` — community root
- `/c/[communitySlug]/discussions` — discussions list
- `/c/[communitySlug]/events` — events list
- `/c/[communitySlug]/resources` — resources list
- `/settings` — user settings
- `/admin` — admin surfaces (role-gated)

### API client layer
- `services/api/` — single place for HTTP calls, typed against shared contracts
- Composable wrappers (`useAuth`, `useCommunities`, `useDiscussions`) consume the API layer
- Components receive data via props or composables, never call API directly

### State management
- Pinia stores for cross-page UI state (auth state, current community, theme)
- No business logic in stores — they hold UI state and cached responses
- Server-side state fetched via `useAsyncData` / `useFetch` wrappers for SSR safety

### SSR safety
- Browser-only APIs (localStorage, window, WebSocket) guarded with `import.meta.client` checks
- Realtime connections initialize post-hydration only (per ADR-012)
- Hydration mismatches caught by dev-time warnings and CI checks

### Rules
- no raw `fetch` or `$fetch` in components or pages
- all API calls go through `services/api/`
- contract types imported from `/contracts/`, never redefined
- route guards use middleware, not inline checks in pages

## Consequences

### Positive
- clear structure for all future Team B feature work
- SSR safety built in from the start
- contract alignment enforced through the API layer
- any team member can find where API calls live

### Negative
- more structure than a bare SPA, requiring discipline
- contributors must learn the layering rules
- contract changes require coordinated API layer updates

## Rules implied by this decision
- components must not make API calls
- route structure changes require updating this ADR or a follow-on
- API client functions must be typed against shared contracts
- SSR output must not depend on browser-only APIs

## Implementation work (Linear sub-issues)

- [ ] [THE-13](https://linear.app/thefoundryengine/issue/THE-13): Nuxt project init + TypeScript config + base directory structure
- [ ] [THE-14](https://linear.app/thefoundryengine/issue/THE-14): Root layout + community-scoped layout
- [ ] [THE-15](https://linear.app/thefoundryengine/issue/THE-15): API client layer scaffold (services/api/ with typed client)
- [ ] [THE-30](https://linear.app/thefoundryengine/issue/THE-30): Route definitions and navigation structure
- [ ] [THE-31](https://linear.app/thefoundryengine/issue/THE-31): Pinia stores baseline (auth, community, theme)
- [ ] [THE-32](https://linear.app/thefoundryengine/issue/THE-32): Auth composables (useAuth) consuming Team A auth contract
- [ ] [THE-33](https://linear.app/thefoundryengine/issue/THE-33): Route middleware (auth guard, community guard)
- [ ] [THE-34](https://linear.app/thefoundryengine/issue/THE-34): SSR-safe rendering baseline (client-only guards, hydration checks)
- [ ] [THE-35](https://linear.app/thefoundryengine/issue/THE-35): PWA manifest and base meta config
- [ ] [THE-36](https://linear.app/thefoundryengine/issue/THE-36): Frontend architecture boundary tests (no raw fetch in components)

## Dependencies

- ADR-007 (frontend architecture) — accepted
- ADR-004 (integration and contract model) — accepted
- Team A auth contract (ADR-F-A-001) — needed for auth composables and route guards
- Team D design token baseline (ADR-F-D-001) — needed for layout and component styling
