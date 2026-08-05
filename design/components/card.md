# Card — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

A card is a grouped content container with optional header/body/footer slots. It is a layout primitive, not an interactive element by default — make a card interactive by wrapping its content in a link/button, not by putting `onclick` on the card.

## Anatomy

```
┌───────────────────────────────┐
│  Header  (optional)           │   ← title, actions
├───────────────────────────────┤
│                               │
│  Body                         │   ← main content
│                               │
├───────────────────────────────┤
│  Footer  (optional)           │   ← actions, meta
└───────────────────────────────┘
```

## Variants

| Variant | Surface | Border | Shadow | Tokens |
|---------|---------|--------|--------|--------|
| Default | `--color-surface` | `1px solid var(--color-border)` | `--shadow-none` | flat, grouped content |
| Outlined | `--color-surface` | `1px solid var(--color-border-strong)` | `--shadow-none` | emphasized grouping |
| Elevated | `--color-surface` | none | `--shadow-md` (hover → `--shadow-lg`) | floating/featured content |

## Slots

| Slot | Element | Notes |
|------|---------|-------|
| Header | `<div class="card-header">` | Title (`--font-size-lg`, `--font-weight-semibold`), optional subtitle (`--font-size-sm`, `--color-text-muted`), optional actions (buttons) on the right |
| Body | `<div class="card-body">` | Default slot; `padding: var(--space-4)` |
| Footer | `<div class="card-footer">` | Actions; top border `1px solid var(--color-border)`; `padding: var(--space-3) var(--space-4)` |

Header and footer have `padding: var(--space-3) var(--space-4)` and a bottom/top divider respectively.

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | |
| `as` | `'div' \| 'section' \| 'article'` | `'section'` | Use `article` for self-contained content (a post); `section` otherwise |
| `title` | `string` | — | Renders header with a heading element |
| `subtitle` | `string` | — | |
| `headerActions` | `ReactNode` | — | Right-aligned actions in header |
| `footer` | `ReactNode` | — | Renders footer slot |
| `children` | `ReactNode` | — | Body content |
| `interactive` | `boolean` | `false` | If true, the whole card is wrapped in a link; adds hover shadow + focus ring on that link |
| `padding` | `'none' \| 'default'` | `'default'` | `none` removes body padding for full-bleed media |

## States

Cards are mostly static. The only stateful variant is `interactive`:

| State | Styling |
|-------|---------|
| Default | variant base |
| Hover (interactive) | `--shadow-lg`, slight `transform: translateY(-1px)` |
| Focus-visible (interactive) | `box-shadow: var(--focus-ring)` on the link |
| Active (interactive) | `transform: translateY(0)` |

## Accessibility

- **Landmark**: render as `<section>` with an accessible name (from `title` via `aria-labelledby`) when it represents a distinct region; otherwise a plain `<div>` is fine.
- **Heading**: when `title` is set, render it as an `<h2>`–`<h4>` appropriate to document outline (consumer picks level via `titleLevel` prop if needed).
- **Interactive card**: the entire clickable area must be a single `<a>` (or `<button>`). Do **not** put `onclick` on the card `<div>` — it's not keyboard-accessible and nests badly with inner links. The "card link" pattern: an `<a>` stretched over the card via `::after { position:absolute; inset:0 }`, with any inner links given `position: relative; z-index: 1` so they stay clickable.
- **Focus**: interactive cards show `--focus-ring` on the link via `:focus-visible`.
- **Content**: don't use color alone to convey meaning in the body (e.g. "red = overdue"); pair with text/icon.
- **Touch target**: any action in header/footer must be a real button/link ≥ 44px.

## Token usage summary

```
background      var(--color-surface)
color           var(--color-surface-foreground)
border          1px solid var(--color-border)        outlined → var(--color-border-strong)
border-radius   var(--radius-lg)
shadow          var(--shadow-none)                   elevated → var(--shadow-md) / hover var(--shadow-lg)
padding (body)  var(--space-4)
padding (h/f)   var(--space-3) var(--space-4)
title           var(--font-size-lg) var(--font-weight-semibold) var(--line-height-tight)
subtitle        var(--font-size-sm) var(--color-text-muted)
divider         1px solid var(--color-border)
transition      box-shadow var(--duration-fast) var(--ease-out),
                transform var(--duration-fast) var(--ease-out)
```
