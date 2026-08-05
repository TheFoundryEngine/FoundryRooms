# Spacing Tokens

> Part of [ADR-F-D-001](../tokens.md) · Team D owns spacing tokens; Team B consumes them.

Spacing uses a **4px base scale**. Use tokens for padding, margin, gap, and positioning. Never hardcode pixel/rem values in components.

## Scale

| Token | Value | CSS variable | Typical use |
|-------|-------|--------------|-------------|
| 0 | 0 | `--space-0` | Reset / no gap |
| 1 | 4px | `--space-1` | Tight icon-to-label gap, fine padding |
| 2 | 8px | `--space-2` | Inline element gaps, small control padding |
| 3 | 12px | `--space-3` | Badge padding, dense list row gap |
| 4 | 16px | `--space-4` | Default content padding, stack gap |
| 6 | 24px | `--space-6` | Section gap, card padding |
| 8 | 32px | `--space-8` | Major section separation |
| 12 | 48px | `--space-12` | Page-level vertical rhythm |
| 16 | 64px | `--space-16` | Hero / large page gaps |

> The numeric suffix is the value in "4px units" up to 4, then switches to the
> Tailwind-style multiplier (6 = 24px, 8 = 32px, 12 = 48px, 16 = 64px). This
> keeps names short while staying unambiguous.

## Usage examples

```css
.card {
  padding: var(--space-4);
  gap: var(--space-2);
}
.stack > * + * { margin-top: var(--space-4); }
.page-section { padding-block: var(--space-12); }
.row { gap: var(--space-2); }       /* 8px between inline items */
.icon-button { padding: var(--space-1); }
```

## Guidance

- **Prefer `gap` over margins** for flex/grid children — it avoids margin-collapse and is easier to reason about.
- **Vertical rhythm**: stack content with `--space-4` between sibling blocks; use `--space-6`/`--space-8` between sections.
- **Don't compound tokens** (e.g. `calc(var(--space-2) + var(--space-1))`). If a value is missing, request it from Team D.
- **Touch targets**: interactive elements should be at least `44px` × `44px`. Combine padding tokens with min-height/min-width to hit this.
