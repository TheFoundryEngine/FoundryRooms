# Layout — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

Layout primitives for page structure: **page shell**, **container** (max-width), and **grid** (responsive). These establish semantic landmarks and the skip-link contract.

## 1. Page shell

### Anatomy

```
<a href="#main" class="skip-link">Skip to main content</a>
<header role="banner"> … header nav … </header>
<aside> … optional sidebar … </aside>
<main id="main" role="main"> … page content … </main>
<footer role="contentinfo"> … site footer … </footer>
```

The page shell composes the header, optional sidebar, main, and footer. It is the top-level wrapper for an application route.

### Variants

| Variant | Arrangement | Usage |
|---------|-------------|-------|
| Centered (default) | header → main → footer, content centered | marketing, auth |
| Sidebar | header → [sidebar + main] → footer | app/dashboard |

### Props

| Prop | Type | Notes |
|------|------|-------|
| `header` | `ReactNode` | rendered in `<header>` |
| `sidebar` | `ReactNode` | optional; switches to sidebar variant |
| `footer` | `ReactNode` | rendered in `<footer>` |
| `children` | `ReactNode` | rendered in `<main id="main">` |
| `skipLinkTarget` | `string` | default `"main"`; id of the main landmark |

## 2. Container

Centers content and caps width at responsive breakpoints. Use inside `main` and within sections.

### Max-width variants

| Variant | Max width | Usage |
|---------|-----------|-------|
| sm | 640px (`40rem`) | narrow forms, article text |
| md | 768px (`48rem`) | default content |
| lg | 1024px (`64rem`) | dashboards, wide content |
| xl | 1280px (`80rem`) | full app shell |
| full | 100% | edge-to-edge |

Horizontal padding: `var(--space-4)` on mobile, `var(--space-6)` ≥ 768px, `var(--space-8)` ≥ 1024px — applied via the container, not by consumers.

### Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'lg'` | |
| `as` | `'div' \| 'section' \| 'main'` | `'div'` | |
| `children` | `ReactNode` | — | |

## 3. Grid

Responsive CSS grid with a sensible default and breakpoint overrides.

### Default columns

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| < 640px | 1 | `--space-4` |
| ≥ 640px (sm) | 2 | `--space-4` |
| ≥ 768px (md) | 2–3 | `--space-6` |
| ≥ 1024px (lg) | 3–4 | `--space-6` |
| ≥ 1280px (xl) | 4–6 | `--space-8` |

### Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `columns` | `number \| { sm?: number; md?: number; lg?: number; xl?: number }` | `{ base: 1, md: 2, lg: 3 }` | responsive column counts |
| `gap` | `token \| { row; col }` | `'--space-4'` | accepts a space token or row/col pair |
| `minItemWidth` | `string` | — | if set, uses `repeat(auto-fill, minmax(minItemWidth, 1fr))` instead of fixed columns |

## Skip link

The skip link is the **first focusable element** in the DOM. It is visually hidden until focused:

```css
.skip-link {
  position: absolute;
  left: var(--space-2);
  top: var(--space-2);
  z-index: 1000;
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-md);
  transform: translateY(-150%);
  transition: transform var(--duration-fast) var(--ease-out);
}
.skip-link:focus { transform: translateY(0); }
```

Target (`#main`) must be focusable: add `tabindex="-1"` to `<main>` so focus can land there programmatically.

## Accessibility

- **Landmarks**: use semantic elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`) so landmarks are exposed without ARIA. Add `role` only when overriding a wrong default.
- **Main landmark**: exactly one `<main>` per page. It must have `id="main"` (or the skip-link target) and `tabindex="-1"` so the skip link can move focus to it.
- **Skip link**: present on every page; first in DOM order; visible on focus; moves focus (not just scroll) to `#main`.
- **Heading hierarchy**: each page has exactly one `<h1>` (in `<main>`). Don't skip levels. The header brand is not an `<h1>` unless it's the home page.
- **Sidebar**: `<aside>` with `aria-label` (e.g. "Secondary") when it's not the primary nav; if it holds the primary nav, label it "Primary" via the inner `<nav>`.
- **Reading order**: ensure DOM order matches visual order (don't use CSS `order` to reorder meaningfully — screen readers follow DOM).
- **Responsive**: layout shifts at breakpoints must not drop content or trap focus. Test with zoom at 200% and at 320px width (WCAG 1.4.10 Reflow).
- **Color contrast**: container/background text ≥ 4.5:1 (verified at token layer).

## Token usage summary

```
page bg          var(--color-background)
page text        var(--color-background-foreground)
header bg        var(--color-surface); border-bottom 1px solid var(--color-border)
sidebar bg       var(--color-surface); border-right 1px solid var(--color-border)
main bg          transparent (inherits page bg)
footer bg        var(--color-surface); border-top 1px solid var(--color-border)
container pad    var(--space-4) → var(--space-6) → var(--space-8) at breakpoints
grid gap         var(--space-4) / var(--space-6) / var(--space-8)
skip-link bg     var(--color-primary); color var(--color-primary-foreground)
skip-link radius var(--radius-md)
focus            box-shadow: var(--focus-ring)
```
