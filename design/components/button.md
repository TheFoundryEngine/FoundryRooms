# Button — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

A button triggers an action. Use `<button>` for in-page actions and `<a>` styled as a button only for navigation.

## Anatomy

```
┌─────────────────────────────┐
│  [leadingIcon]  Label  [→]  │   ← optional icons, required label
└─────────────────────────────┘
```

- **Label**: required text (or `aria-label` if icon-only). `--font-weight-medium`.
- **Leading icon** (optional): 16px or 20px, `currentColor`.
- **Trailing icon** (optional): e.g. chevron, external-link.
- **Spinner** (loading state): replaces label icon area.

## Variants

| Variant | Visual | Tokens |
|---------|--------|--------|
| Primary | solid primary fill | `bg --color-primary`, `color --color-primary-foreground`, `border --color-primary` |
| Secondary | solid neutral fill | `bg --color-secondary`, `color --color-secondary-foreground`, `border --color-secondary` |
| Ghost | transparent, border on hover | `bg transparent`, `color --color-text`, `border 1px solid transparent` → hover `border --color-border` |
| Destructive | solid error fill | `bg --color-error`, `color --color-error-foreground`, `border --color-error` |

## Sizes

| Size | Height | Padding (y x) | Font size | Icon size |
|------|--------|---------------|-----------|-----------|
| sm | 32px | `--space-1` `--space-2` | `--font-size-sm` | 16px |
| md | 40px | `--space-2` `--space-3` | `--font-size-base` | 20px |
| lg | 48px | `--space-3` `--space-4` | `--font-size-lg` | 20px |

Min-width ensures touch target ≥ 44px for md/lg; sm is for dense toolbars only.

## States

| State | Styling | Notes |
|-------|---------|-------|
| Default | variant base | — |
| Hover | `--color-*-dark` for bg/border | `transition var(--duration-fast) var(--ease-out)` |
| Focus-visible | `box-shadow: var(--focus-ring); outline: none;` | Only on keyboard focus |
| Active | `--color-*-dark` + `transform: translateY(1px)` | Pressed feedback |
| Disabled | `opacity: 0.5; cursor: not-allowed;` + `aria-disabled="true"` | No hover/focus changes; not clickable |
| Loading | spinner replaces leading icon; `aria-busy="true"`; `pointer-events: none` on the button | Label remains visible; button is non-interactive |

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `disabled` | `boolean` | `false` | Renders `aria-disabled`, sets `disabled` on native button |
| `loading` | `boolean` | `false` | Shows spinner, sets `aria-busy`, blocks interaction |
| `iconLeading` / `iconTrailing` | `ReactNode` | — | 16/20px, `currentColor` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Always default to `button` to avoid accidental submits |
| `fullWidth` | `boolean` | `false` | `width: 100%` |
| `onClick` | `(e: MouseEvent) => void` | — | Not fired when disabled/loading |

## Accessibility

- **Element**: native `<button>` (or `<a role="button">` only when it navigates). Do not use `<div onclick>`.
- **Label**: must have an accessible name. If icon-only, set `aria-label`.
- **Focus**: keyboard-focusable by default; show `--focus-ring` on `:focus-visible`. Never remove focus outline without replacing it with the ring.
- **Disabled**: use the native `disabled` attribute (removes it from tab order) **or** `aria-disabled="true"` + `tabindex="-1"` + click suppression if you need it to remain in the layout flow. Pick one strategy per codebase.
- **Loading**: set `aria-busy="true"`; keep the button in the tab order but block clicks; the spinner must be `aria-hidden` (the label text conveys state).
- **Keyboard**: `Enter` and `Space` activate (native behavior — don't prevent it). `Space` should not scroll the page when focus is on the button (native).
- **Color contrast**: variant foreground on fill ≥ 4.5:1 (verified at token layer). Disabled state is exempt per WCAG (1.4.3 note).

## Token usage summary

```
background      var(--color-<variant>)            hover/active → var(--color-<variant>-dark)
color           var(--color-<variant>-foreground)
border          1px solid var(--color-<variant>)  ghost default → transparent
border-radius   var(--radius-md)
padding         --space-<size> tokens (see Sizes)
font-size       var(--font-size-<size>)
font-weight     var(--font-weight-medium)
transition      var(--duration-fast) var(--ease-out)
focus           box-shadow: var(--focus-ring)
```
