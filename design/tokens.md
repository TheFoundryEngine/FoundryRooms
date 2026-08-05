# FoundryRooms Design Tokens — Master Reference

**ADR-F-D-001** · Owner: **Team D** · Consumers: **Team B** (and all UI work)

This document is the index for the FoundryRooms design token system. Tokens are the **single source of truth** for visual properties. The canonical machine-readable definition lives in [`tokens.css`](./tokens.css); the per-category docs below explain intent and usage.

## Why tokens

- **Consistency**: every component draws from the same palette/scale, so the product looks coherent without per-component design review.
- **Theming**: dark mode and future themes swap values in one place (`[data-theme="dark"]`), not in every component.
- **Accessibility**: contrast is verified once, at the token layer (`tests/design-tokens.test.ts`), so compliant components are guaranteed by construction.
- **Velocity**: Team B implements from specs without blocking on Team D for every shade/spacing decision.

## Files

| File | Purpose |
|------|---------|
| [`tokens.css`](./tokens.css) | All CSS custom properties (the source of truth) |
| [`tokens/color.md`](./tokens/color.md) | Color tokens, themes, contrast notes |
| [`tokens/spacing.md`](./tokens/spacing.md) | 4px spacing scale |
| [`tokens/typography.md`](./tokens/typography.md) | Fonts, sizes, weights, line heights |
| [`tokens/motion.md`](./tokens/motion.md) | Durations, easing, reduced-motion |
| [`tokens/radius.md`](./tokens/radius.md) | Radius + shadow |
| [`accessibility-checklist.md`](./accessibility-checklist.md) | WCAG 2.1 AA checklist per component |
| [`components/*.md`](./components/) | Specs for the 8 baseline components |

## Naming conventions

```
--<category>-<name>[-<modifier>]
```

- **category**: `color`, `space`, `font`, `font-size`, `font-weight`, `line-height`, `duration`, `ease`, `radius`, `shadow`.
- **name**: the semantic role (`primary`, `surface`, `text`, `success`, …) or the scale step (`1`, `2`, `sm`, `xl`).
- **modifier** (optional): `dark`, `light`, `foreground`, `muted`, `strong`, `inverse`.

Examples:

| Variable | Reads as |
|----------|----------|
| `--color-primary-dark` | color · primary · dark variant (hover/active) |
| `--color-surface-foreground` | color · surface · text-on-surface |
| `--space-4` | space · step 4 (16px) |
| `--font-size-2xl` | font-size · 2xl (24px) |
| `--duration-normal` | duration · normal (250ms) |
| `--radius-lg` | radius · lg (12px) |

**Rules**

1. Semantic names beat literal names. Prefer `--color-error` over `--color-red-600`; the hex can change without renaming consumers.
2. `foreground` = the text/icon color meant to sit *on top of* the matching fill. Pair them: `background: var(--color-primary); color: var(--color-primary-foreground);`.
3. `dark`/`light` modifiers are *intensity* steps (hover/subtle-fill), **not** theme selectors. Theme switching is handled by the `[data-theme]` selector, not by token name.
4. Don't introduce `--color-primary-2`-style numeric aliases. Request a named modifier from Team D.

## Categories at a glance

### Color
8 semantic groups (primary, secondary, surface, background, text, border, status×4) each with base/dark/light/foreground. Light + dark themes. All text/background pairs ≥ 4.5:1 (WCAG 2.1 AA). See [`tokens/color.md`](./tokens/color.md).

### Spacing
4px base scale: `0, 4, 8, 12, 16, 24, 32, 48, 64` → `--space-0` … `--space-16`. See [`tokens/spacing.md`](./tokens/spacing.md).

### Typography
- Families: `--font-sans` (system), `--font-mono` (code).
- Sizes: `xs` (12) → `4xl` (36).
- Weights: normal (400) → bold (700).
- Line heights: tight (1.25), normal (1.5), relaxed (1.75).
See [`tokens/typography.md`](./tokens/typography.md).

### Motion
Durations fast/normal/slow (150/250/400ms); easing in/out/in-out/spring. `prefers-reduced-motion` zeroes durations automatically. See [`tokens/motion.md`](./tokens/motion.md).

### Radius & shadow
Radius none/sm/md/lg/xl/full; shadow none/sm/md/lg (re-tuned for dark mode). See [`tokens/radius.md`](./tokens/radius.md).

## How to use tokens in a component

```css
.my-card {
  /* Color */
  background: var(--color-surface);
  color: var(--color-surface-foreground);
  border: 1px solid var(--color-border);

  /* Spacing */
  padding: var(--space-4);
  gap: var(--space-2);

  /* Typography */
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);

  /* Radius + shadow */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  /* Motion */
  transition: box-shadow var(--duration-fast) var(--ease-out);
}

.my-card:hover { box-shadow: var(--shadow-md); }
.my-card:focus-visible { box-shadow: var(--focus-ring); outline: none; }
```

## Change management — "token changes ripple"

Because every component references tokens, **changing a token value changes every consumer at once.** This is a feature, not a bug, but it means:

1. **Token changes require a spec update** in the relevant `tokens/*.md` and, if contrast is affected, a re-run of `tests/design-tokens.test.ts`.
2. **Renaming or removing a token** is a breaking change for Team B. Open an ADR amendment, list consumers, and provide a migration (alias the old name to the new one for one release).
3. **Adding a token** is non-breaking; document it and add a test asserting its presence.
4. **Contract**: Team D may change *values* freely (with docs + test updates). Team D may **not** change *names* without coordination with Team B.
5. **Team B must never override a token value locally** (e.g. `--color-primary: #f00;` inside a component). If a variant needs a different value, request a new token.

## Verification

```
npx vitest run tests/design-tokens.test.ts
```

This test asserts:
- `tokens.css` exists and defines every expected custom property.
- All token docs and component specs exist.
- Light- and dark-theme color pairs meet WCAG 2.1 AA contrast (4.5:1 text, 3:1 UI).

Failing this test blocks merge (it runs in the `test` script and on `pre-push`).
