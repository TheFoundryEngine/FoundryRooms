# Motion Tokens

> Part of [ADR-F-D-001](../tokens.md) · Team D owns motion tokens; Team B consumes them.

Motion communicates state change without distracting. Keep durations short and easing consistent.

## Durations

| Token | Value | CSS variable | Usage |
|-------|-------|--------------|-------|
| Fast | 150ms | `--duration-fast` | Hover, focus, color/state transitions |
| Normal | 250ms | `--duration-normal` | Toggles, small panel reveals, badge swaps |
| Slow | 400ms | `--duration-slow` | Modal/dialog open, large panel slide, page transitions |

## Easing curves

| Token | CSS variable | Curve | Usage |
|-------|--------------|-------|-------|
| Ease in | `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting / accelerating away |
| Ease out | `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering / decelerating in (default) |
| Ease in-out | `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric transitions (expands/collapses) |
| Spring | `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot — badges, toggles, avatars |

## Reduced motion

A `prefers-reduced-motion: reduce` media query **zeroes out all durations** and swaps spring easing for a plain ease-in-out. Components that use these tokens automatically comply — **do not bypass the tokens with literal `transition` values.**

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --ease-spring: var(--ease-in-out);
  }
}
```

## Usage examples

```css
.button {
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}
.modal-panel {
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
.badge { transition: transform var(--duration-fast) var(--ease-spring); }
```

## Guidance

- **Default to `--ease-out`** for things appearing, `--ease-in` for things disappearing.
- **Cap meaningful animation at 400ms.** Anything longer feels laggy for UI.
- **Never animate layout properties** (`width`, `height`, `top`, `left`) when `transform`/`opacity` will do — they cause reflow.
- **Respect reduced motion.** If a component *must* animate layout, gate it behind `@media (prefers-reduced-motion: reduce)` explicitly.
