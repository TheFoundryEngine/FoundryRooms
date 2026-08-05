# ADR-F-D-001: Design Token and Component Baseline

- **Status:** Proposed
- **Date:** 2026-08-05
- **Owners:** Team D lead, paired agent
- **Related:** ADR-007
- **Linear Project:** Team D — Design & UX ADRs
- **Linear Issue:** [THE-8](https://linear.app/thefoundryengine/issue/THE-8/adr-f-d-001-design-token-and-component-baseline)

## Context

Before Team B can build frontend features, there must be a design token baseline and component specification that Team B implements against. ADR-007 defines the ownership split: Team D owns the design system, tokens, and specs; Team B implements frontend against approved Team D design contracts.

Without a token baseline, every Team B component would make ad hoc styling decisions, leading to visual inconsistency and unmaintainable CSS. This feature ADR defines the initial token set and component inventory that anchors all future design work.

## Decision

### Design tokens
- **Color**: primary, secondary, surface, background, text, border, status (success, warning, error, info) — each with light/dark variants
- **Spacing**: 4px base scale (0, 4, 8, 12, 16, 24, 32, 48, 64)
- **Typography**: font family (sans, mono), sizes (xs, sm, base, lg, xl, 2xl), weights (normal, medium, semibold, bold), line heights
- **Motion**: duration (fast 150ms, normal 250ms, slow 400ms), easing curves
- **Radius**: none (0), sm (4px), md (8px), lg (12px), full (9999px)
- **Shadow**: none, sm, md, lg

### Token format
- Tokens defined as CSS custom properties (`--color-primary`, `--space-4`, etc.)
- Dark mode via `data-theme="dark"` attribute on root element
- Tokens documented in `design/tokens.md` with usage guidance
- Token values are the single source of truth — no hardcoded colors or spacing in components

### Component inventory (baseline set)
- Button (primary, secondary, ghost, destructive; sizes sm, md, lg)
- Input (text, email, password, textarea; with label, error, helper text)
- Card (surface container with padding, border, radius)
- Avatar (image with fallback, sizes sm, md, lg)
- Badge (status indicator, color-mapped)
- Navigation (header nav, sidebar nav, breadcrumb)
- Modal/Dialog (overlay, focus trap, escape to close)
- Layout (page shell, content container, grid)

### Accessibility baseline
- WCAG 2.1 AA target
- Color contrast: minimum 4.5:1 for normal text, 3:1 for large text
- Focus visible on all interactive elements
- Keyboard navigation for all components
- ARIA patterns for modal, navigation, form fields

### Design handoff contract
- Component specs in `design/components/` with: anatomy, states, props, accessibility notes
- Token reference in `design/tokens.md`
- Team B implements against these specs in `apps/frontend/components/`
- Changes to specs require a Team D ADR update or follow-on ADR

### Rules
- no hardcoded color values in components — use tokens
- no hardcoded spacing — use the spacing scale
- all components must meet WCAG 2.1 AA
- component spec changes require ADR update
- Team B may not modify tokens — only Team D owns token definitions

## Consequences

### Positive
- consistent visual language across the entire product
- Team B has a clear contract to implement against
- dark mode supported from the start via token variants
- accessibility built in, not retrofitted

### Negative
- upfront design cost before features can be styled
- token changes ripple across all components
- Team B must wait for Team D specs before finalizing component styling

## Rules implied by this decision
- tokens are the single source of truth for visual properties
- component specs are contracts — changes require ADR
- accessibility is non-negotiable for baseline components
- Team D owns token definitions, Team B owns component implementations

## Implementation work (Linear sub-issues)

- [ ] [THE-19](https://linear.app/thefoundryengine/issue/THE-19): Color token definitions (light + dark) + CSS custom properties
- [ ] [THE-45](https://linear.app/thefoundryengine/issue/THE-45): Spacing scale token definitions
- [ ] [THE-46](https://linear.app/thefoundryengine/issue/THE-46): Typography token definitions
- [ ] [THE-47](https://linear.app/thefoundryengine/issue/THE-47): Motion and radius token definitions
- [ ] [THE-48](https://linear.app/thefoundryengine/issue/THE-48): Token documentation (design/tokens.md)
- [ ] [THE-20](https://linear.app/thefoundryengine/issue/THE-20): Button component spec (anatomy, states, props, a11y)
- [ ] [THE-21](https://linear.app/thefoundryengine/issue/THE-21): Input component spec (text, email, password, textarea)
- [ ] [THE-49](https://linear.app/thefoundryengine/issue/THE-49): Card component spec
- [ ] [THE-50](https://linear.app/thefoundryengine/issue/THE-50): Avatar component spec
- [ ] [THE-51](https://linear.app/thefoundryengine/issue/THE-51): Badge component spec
- [ ] [THE-52](https://linear.app/thefoundryengine/issue/THE-52): Navigation component spec (header, sidebar, breadcrumb)
- [ ] [THE-53](https://linear.app/thefoundryengine/issue/THE-53): Modal/Dialog component spec (focus trap, a11y)
- [ ] [THE-54](https://linear.app/thefoundryengine/issue/THE-54): Layout component spec (page shell, container, grid)
- [ ] [THE-55](https://linear.app/thefoundryengine/issue/THE-55): Accessibility conformance checklist for baseline components

## Dependencies

- ADR-007 (frontend architecture) — accepted
- Team B frontend shell (ADR-F-B-001) — consumes these tokens and specs
- No upstream ADR blockers — Team D can start immediately
