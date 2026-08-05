# Navigation — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

Three navigation patterns sharing token usage and accessibility rules: **header nav** (top bar), **sidebar nav** (vertical), and **breadcrumbs**. All use real `<nav>` landmarks and links.

## 1. Header navigation

### Anatomy

```
┌──────────────────────────────────────────────────────────┐
│ [Logo]   Nav items…        [search]   [avatar/actions]    │
└──────────────────────────────────────────────────────────┘
```

- **Logo/brand**: links home, `aria-label="FoundryRooms home"`.
- **Primary items**: `<ul>` of `<a>` inside `<nav aria-label="Primary">`.
- **Actions**: right-aligned buttons/avatar.
- **Mobile**: collapses into a hamburger menu (see Responsive below).

### States (per item)

| State | Styling |
|-------|---------|
| Default | `color var(--color-text-muted)` |
| Hover | `color var(--color-text)`, subtle `bg var(--color-surface-dark)` |
| Focus-visible | `box-shadow: var(--focus-ring)` |
| Current page | `aria-current="page"`, `color var(--color-primary)`, `font-weight var(--font-weight-medium)`, 2px bottom border `var(--color-primary)` |

## 2. Sidebar navigation

### Anatomy

```
┌──────────────┐
│  Section     │   ← group label, --font-size-xs uppercase, --color-text-muted
│  • Item      │   ← current item: left 2px border --color-primary + bg --color-primary-light
│  • Item      │
│  Section     │
│  • Item      │
└──────────────┘
```

- Width: 240px (`15rem`) on desktop; collapses to an off-canvas drawer on mobile.
- Items are `<a>`; nested items indent by `--space-4` and use a smaller font.
- Current item: `aria-current="page"`, `bg var(--color-primary-light)`, `color var(--color-primary-dark)` (light) / `--color-primary` (dark), left border `2px solid var(--color-primary)`.

### States (per item)

Same as header, plus:
- **Expanded/collapsed group** (if nested): group header is a `<button aria-expanded>` toggling the sublist.

## 3. Breadcrumbs

### Anatomy

```
Home  /  Section  /  Current page
```

- `<nav aria-label="Breadcrumb">` wrapping an `<ol>`.
- Each crumb is an `<li>` containing an `<a>`; the **last** crumb represents the current page and is `aria-current="page"` (rendered as plain text, not a link).
- Separators (`/` or chevron) are `aria-hidden` and inserted via CSS `::before` so they aren't announced.

## Responsive collapse

- **Header**: below the `md` breakpoint (768px), primary items move into a disclosure menu triggered by a hamburger `<button aria-expanded aria-controls>`. The menu is a `<div role="menu">` (or a simple disclosure) with items as `<a role="menuitem">`. Focus moves to the first item on open; `Escape` closes and returns focus to the hamburger.
- **Sidebar**: below `lg` (1024px), the sidebar becomes an off-canvas drawer. A menu button toggles `aria-expanded`; the drawer traps focus while open (reuse the modal focus-trap) and closes on `Escape` / overlay click.
- **Breadcrumbs**: on small screens, collapse to show only the current page with a "back" affordance, or truncate middle crumbs with an ellipsis `<button>` that expands them.

## Props (API)

### Header nav

| Prop | Type | Notes |
|------|------|-------|
| `items` | `Array<{ label: string; href: string; current?: boolean }>` | |
| `brand` | `ReactNode` | logo/home link |
| `actions` | `ReactNode` | right-aligned slot |

### Sidebar nav

| Prop | Type | Notes |
|------|------|-------|
| `sections` | `Array<{ label: string; items: NavItem[] }>` | grouped items |
| `items` | `Array<{ label; href; current?; children?: NavItem[] }>` | flat or nested |

### Breadcrumbs

| Prop | Type | Notes |
|------|------|-------|
| `items` | `Array<{ label; href }>` | last item is current |

## Accessibility

- **Landmark**: each `<nav>` has an `aria-label` distinguishing it ("Primary", "Breadcrumb", "Section"). Multiple `<nav>`s on a page need unique labels.
- **Current page**: use `aria-current="page"` (not `aria-selected`, which is for tabs). Visual styling follows.
- **Keyboard**: all nav items are real links → keyboard-accessible by default. `Tab` moves through them in order. Don't trap focus except in the mobile disclosure/drawer.
- **Hamburger / drawer button**: `aria-expanded`, `aria-controls` (id of the menu it toggles), and an `aria-label` like "Open menu".
- **Breadcrumbs**: `aria-label="Breadcrumb"`; last item `aria-current="page"`; separators `aria-hidden`.
- **Skip link**: the first focusable element on the page should be a "Skip to main content" link (see [layout.md](./layout.md)). Navigation landmarks come after it.
- **Hover-only menus** (dropdowns in the header) are forbidden — they're inaccessible to keyboard/touch. Use click-to-open with `aria-expanded`.
- **Color contrast**: nav item text on header background ≥ 4.5:1; current-page accent (`--color-primary` on background) ≥ 4.5:1 (verified at token layer).

## Token usage summary

```
nav bg          var(--color-surface)            (header) / var(--color-surface) (sidebar)
nav border      1px solid var(--color-border)   (bottom of header, right of sidebar)
item color      var(--color-text-muted)         hover → var(--color-text)
item padding    var(--space-2) var(--space-3)
item radius     var(--radius-md)
current item    color var(--color-primary) (light) / var(--color-primary) (dark)
                border-bottom 2px var(--color-primary)   (header)
                border-left 2px var(--color-primary)     (sidebar)
                bg var(--color-primary-light)            (sidebar)
section label   var(--font-size-xs) uppercase var(--color-text-muted) var(--font-weight-medium)
breadcrumb sep  var(--color-text-muted) aria-hidden
focus           box-shadow: var(--focus-ring)
transition      color/background var(--duration-fast) var(--ease-out)
```
