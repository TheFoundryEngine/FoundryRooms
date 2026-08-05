# Color Tokens

> Part of [ADR-F-D-001](../tokens.md) · Team D owns color tokens; Team B consumes them.

Color is expressed as CSS custom properties. **Never hardcode hex values in components** — always reference a token. If a needed shade is missing, request it from Team D rather than inventing one.

## Themes

- **Light** (default): defined on `:root`.
- **Dark**: defined on `[data-theme="dark"]`. Toggle by setting `data-theme="dark"` on `<html>` (or any ancestor of the component subtree).

Components reference the *same* variable name in both themes; the resolved value swaps automatically.

## Token reference

### Primary — brand / primary actions

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Primary | `#2563eb` | `#60a5fa` | `--color-primary` | Primary button fill, links, focus accents |
| Primary dark | `#1d4ed8` | `#3b82f6` | `--color-primary-dark` | Hover/active state of primary |
| Primary light | `#dbeafe` | `#1e3a8a` | `--color-primary-light` | Subtle fills, selected-row tint, badge subtle |
| Primary foreground | `#ffffff` | `#0b1220` | `--color-primary-foreground` | Text/icon on a primary fill |

### Secondary — supporting actions

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Secondary | `#475569` | `#94a3b8` | `--color-secondary` | Secondary button fill, muted icons |
| Secondary dark | `#334155` | `#cbd5e1` | `--color-secondary-dark` | Hover/active of secondary |
| Secondary light | `#e2e8f0` | `#1e293b` | `--color-secondary-light` | Subtle fills, disabled tint |
| Secondary foreground | `#ffffff` | `#0b1220` | `--color-secondary-foreground` | Text/icon on a secondary fill |

### Surface — cards, panels, inputs

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Surface | `#ffffff` | `#1e293b` | `--color-surface` | Card, modal, input, popover backgrounds |
| Surface dark | `#f1f5f9` | `#0f172a` | `--color-surface-dark` | Inset/recessed surfaces, code blocks |
| Surface foreground | `#0f172a` | `#f1f5f9` | `--color-surface-foreground` | Text on a surface |

### Background — page backdrop

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Background | `#f8fafc` | `#0b1220` | `--color-background` | Page/app background |
| Background foreground | `#0f172a` | `#e2e8f0` | `--color-background-foreground` | Text on the page background |

### Text

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Text | `#0f172a` | `#e2e8f0` | `--color-text` | Primary body text |
| Text muted | `#475569` | `#94a3b8` | `--color-text-muted` | Helper text, captions, secondary labels |
| Text inverse | `#ffffff` | `#0f172a` | `--color-text-inverse` | Text on dark/colored fills (fallback) |

### Border

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Border | `#e2e8f0` | `#334155` | `--color-border` | Default 1px borders, dividers |
| Border strong | `#cbd5e1` | `#475569` | `--color-border-strong` | Emphasized borders, input focus-adjacent |
| Border focus | `#2563eb` | `#60a5fa` | `--color-border-focus` | Input border on focus (alias of primary) |

### Status — success

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Success | `#15803d` | `#4ade80` | `--color-success` | Success badge, validation pass |
| Success dark | `#166534` | `#22c55e` | `--color-success-dark` | Hover/active of success |
| Success light | `#dcfce7` | `#14532d` | `--color-success-light` | Success subtle fill |
| Success foreground | `#ffffff` | `#052e16` | `--color-success-foreground` | Text/icon on success fill |

### Status — warning

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Warning | `#b45309` | `#fbbf24` | `--color-warning` | Warning badge, cautionary notices |
| Warning dark | `#92400e` | `#f59e0b` | `--color-warning-dark` | Hover/active of warning |
| Warning light | `#fef3c7` | `#78350f` | `--color-warning-light` | Warning subtle fill |
| Warning foreground | `#ffffff` | `#1a1206` | `--color-warning-foreground` | Text/icon on warning fill |

### Status — error

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Error | `#dc2626` | `#f87171` | `--color-error` | Error badge, validation fail, destructive actions |
| Error dark | `#b91c1c` | `#ef4444` | `--color-error-dark` | Hover/active of error/destructive |
| Error light | `#fee2e2` | `#7f1d1d` | `--color-error-light` | Error subtle fill, error input border tint |
| Error foreground | `#ffffff` | `#2b0606` | `--color-error-foreground` | Text/icon on error fill |

### Status — info

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Info | `#0369a1` | `#38bdf8` | `--color-info` | Info badge, neutral notices, info text |
| Info dark | `#075985` | `#0ea5e9` | `--color-info-dark` | Hover/active of info |
| Info light | `#e0f2fe` | `#0c4a6e` | `--color-info-light` | Info subtle fill |
| Info foreground | `#ffffff` | `#04222f` | `--color-info-foreground` | Text/icon on info fill |

### Focus ring

| Token | Light | Dark | CSS variable | Usage |
|-------|-------|------|--------------|-------|
| Focus ring | `#2563eb` | `#60a5fa` | `--color-focus-ring` | 2px ring drawn around focused elements |
| Focus ring offset | `#ffffff` | `#0b1220` | `--color-focus-ring-offset` | 2px gap between element and ring |
| Focus ring (composite) | — | — | `--focus-ring` | Ready-made `box-shadow` value; apply directly |

## Contrast

All foreground/background pairs in this set meet **WCAG 2.1 AA**:

- **4.5:1** minimum for normal text (≤ 18px regular or ≤ 14px bold).
- **3:1** minimum for large text and UI component boundaries.

Verified programmatically in `tests/design-tokens.test.ts`. Notes:

- `--color-success` (light) uses green-700 (`#15803d`) rather than green-600 — green-600 with white text only reaches ~3.3:1, which fails AA. Green-700 reaches 5.02:1 for white-on-fill and 4.80:1 as text on white.
- `--color-info` (light) uses sky-700 (`#0369a1`) rather than sky-600 — sky-600 with white text only reaches ~4.1:1. Sky-700 reaches 5.93:1 for white-on-fill and 5.67:1 as text on white.
- `--color-warning` (light) uses amber-700 (`#b45309`) — amber-500/600 fail AA either as text or with white text.

## Usage examples

```css
/* Primary button */
.btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: 1px solid var(--color-primary);
}
.btn--primary:hover { background: var(--color-primary-dark); }

/* Card */
.card {
  background: var(--color-surface);
  color: var(--color-surface-foreground);
  border: 1px solid var(--color-border);
}

/* Error input */
.input--error {
  border-color: var(--color-error);
}
.input--error + .helper--error {
  color: var(--color-error-dark); /* darker for AA text on bg */
}
```
