# Badge — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

A badge labels, categorizes, or signals status for a nearby element. It is **non-interactive** by default. Use a pill button or tag component for dismissable/removable labels.

## Anatomy

```
●  Label          ← optional leading dot + text
```

## Variants

| Variant | Visual | Tokens |
|---------|--------|--------|
| Solid | status fill + foreground | `bg --color-<status>`, `color --color-<status>-foreground` |
| Subtle | light fill + dark status text | `bg --color-<status>-light`, `color --color-<status>-dark` |
| Outline | transparent + status border + status text | `border 1px solid var(--color-<status>)`, `color --color-<status>-dark` (light) / `--color-<status>` (dark) |

`status` ∈ `neutral | primary | success | warning | error | info`. `neutral` maps to secondary tokens.

## Sizes

| Size | Height | Padding (y x) | Font size | Dot |
|------|--------|---------------|-----------|-----|
| sm | 20px | `--space-0` `--space-1` | `--font-size-xs` | 6px |
| md | 24px | `--space-1` `--space-2` | `--font-size-sm` | 8px |

## Dot

Optional leading dot. Same status color as the badge text/fill. In `subtle`/`outline` variants the dot uses the saturated `--color-<status>` (not the `-dark` text color) so it stays visible. The dot is `aria-hidden`.

## States

Badges are static. The only "state" is the status prop. If a badge represents a *live* status that changes (e.g. "syncing" → "synced"), wrap it in a container with `aria-live="polite"` so the change is announced; the badge itself stays non-interactive.

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `status` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'neutral'` | |
| `variant` | `'solid' \| 'subtle' \| 'outline'` | `'subtle'` | |
| `size` | `'sm' \| 'md'` | `'md'` | |
| `dot` | `boolean` | `false` | shows leading dot |
| `children` | `string` | **required** | short label; badges don't wrap (white-space: nowrap) |
| `iconLeading` | `ReactNode` | — | alternative to dot |

## Accessibility

- **Role**: badges are static text → no ARIA role needed. Do **not** use `role="status"` on every badge (it's noisy); only wrap *updating* status badges in an `aria-live="polite"` region.
- **Color is not meaning**: a red badge must also say "Error" / "Failed". Never rely on color alone (WCAG 1.4.1).
- **Contrast**: solid variant foreground-on-fill ≥ 4.5:1; subtle/outline text-on-background ≥ 4.5:1 (verified at token layer).
- **Dot**: `aria-hidden="true"` — it's decorative; the label conveys status.
- **Placement**: associate the badge with its subject. In a list row, put the badge inside the row's label so screen readers read "Request 123, Approved" together.
- **Truncation**: badges should hold short text. If text can be long, allow `title` for a tooltip and truncate with ellipsis — but prefer short, fixed labels.

## Token usage summary

```
solid        bg var(--color-<status>);            color var(--color-<status>-foreground)
subtle       bg var(--color-<status>-light);      color var(--color-<status>-dark) / --color-<status> (dark)
outline      bg transparent;                       color var(--color-<status>-dark) / --color-<status> (dark)
             border 1px solid var(--color-<status>)
neutral      maps to <status>=secondary tokens
border-radius var(--radius-sm)
font-size    var(--font-size-xs) | var(--font-size-sm)
font-weight  var(--font-weight-medium)
line-height  var(--line-height-tight)
padding      sm: 0 var(--space-1); md: var(--space-1) var(--space-2)
dot          var(--color-<status>); border-radius var(--radius-full)
```
