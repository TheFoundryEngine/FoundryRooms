# Modal / Dialog — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

A modal is an overlay dialog that demands attention, blocking interaction with the page behind it. Implements the WAI-ARIA [dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/).

## Anatomy

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ← backdrop (overlay), --color-background at 50% opacity
░░░░ ┌───────────────────────┐ ░░░░
░░░░ │  Title            [×] │ ░░░░   ← header: title + close button
░░░░ ├───────────────────────┤ ░░░░
░░░░ │                       │ ░░░░
░░░░ │  Body content         │ ░░░░   ← scrollable region
░░░░ │                       │ ░░░░
░░░░ ├───────────────────────┤ ░░░░
░░░░ │  Footer actions       │ ░░░░   ← optional
░░░░ └───────────────────────┘ ░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

## Sizes

| Size | Max width | Usage |
|------|-----------|-------|
| sm | 400px | Confirmations, short forms |
| md | 560px | Default forms, details |
| lg | 800px | Multi-step, tables |
| fullscreen | 100vw × 100vh (minus safe areas) | Image editors, complex workflows |

`max-height: 85vh`; body scrolls internally (`overflow: auto`) when content overflows.

## Slots

| Slot | Element | Notes |
|------|---------|-------|
| Title | `<h2>` (or heading level appropriate to context) inside header | Required; referenced by `aria-labelledby` on the dialog |
| Close button | `<button aria-label="Close">` icon button, top-right | Always present unless `dismissable={false}` |
| Body | `<div class="modal-body">` | main content; `padding: var(--space-4)` |
| Footer | `<div class="modal-footer">` | actions (Cancel / Confirm); right-aligned, `gap: var(--space-2)` |

## States

| State | Visual | Notes |
|-------|--------|-------|
| Entering | backdrop fades in (`opacity 0→1`), panel scales/translates in | `--duration-slow var(--ease-out)` |
| Open | full opacity, focus trapped inside | scroll lock on `<body>` |
| Exiting | reverse of entering | unmount after duration; restore focus |
| Loading (confirm action) | confirm button shows spinner + `aria-busy` | modal stays open until action resolves |

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `open` | `boolean` | `false` | controlled; component renders nothing when false |
| `onClose` | `() => void` | — | called on backdrop click, Escape, close button |
| `title` | `string` | **required** | rendered as heading; wired to `aria-labelledby` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'fullscreen'` | `'md'` | |
| `dismissable` | `boolean` | `true` | if false, hides close button and ignores backdrop/Escape (use for required-action flows) |
| `initialFocus` | `HTMLElement \| 'first' \| 'close'` | `'close'` | where focus lands on open |
| `footer` | `ReactNode` | — | action buttons |
| `children` | `ReactNode` | — | body |

## Accessibility

- **Role**: `role="dialog"` + `aria-modal="true"` on the panel. `aria-labelledby` points to the title id; if no visible title, use `aria-label`.
- **Focus trap**: when open, `Tab` cycles only within the dialog. The first focusable element receives focus on open (default: the close button, or `initialFocus`). On close, **focus returns to the element that had focus before opening** (the trigger).
- **Scroll lock**: set `overflow: hidden` on `<body>` (and `padding-right` to compensate for scrollbar width to avoid layout shift) while open. Restore on close.
- **Escape to close**: `Escape` key calls `onClose` (unless `dismissable={false}`).
- **Backdrop click**: clicking the backdrop calls `onClose` (unless `dismissable={false}`). Clicks *inside* the panel do not bubble to the backdrop — stop propagation or check `e.target`.
- **Close button**: `<button type="button" aria-label="Close">` with a visible icon (× or chevron). Always in the tab order, typically first.
- **Live region**: do **not** use `aria-live` on the dialog itself; `aria-modal` handles announcement. Screen readers announce the title when the dialog opens.
- **Nesting**: avoid nested modals. If unavoidable, each must trap focus independently and only the topmost is `aria-modal="true"`; lower ones get `aria-hidden="true"`.
- **Fullscreen**: still a dialog (`role="dialog"`); ensure the close button remains reachable and the body scrolls.
- **Motion**: entrance/exit must respect `prefers-reduced-motion` (tokens already zero durations). The dialog must still be operable with motion off.

## Token usage summary

```
backdrop         background: rgba(0,0,0,0.5)  (light) / rgba(0,0,0,0.7) (dark)
                 or var(--color-background) at 50% opacity via color-mix
panel bg         var(--color-surface)
panel color      var(--color-surface-foreground)
panel border     1px solid var(--color-border)   (omitted for fullscreen)
panel radius     var(--radius-xl)                 (none for fullscreen)
panel shadow     var(--shadow-lg)
panel max-height 85vh
body padding     var(--space-4)
header padding   var(--space-3) var(--space-4) + bottom border var(--color-border)
footer padding   var(--space-3) var(--space-4) + top border var(--color-border)
title            var(--font-size-lg) var(--font-weight-semibold)
close button     32px, var(--radius-md), ghost button styling
focus            box-shadow: var(--focus-ring)
transition       opacity/transform var(--duration-slow) var(--ease-out)
```
