# Accessibility Checklist — WCAG 2.1 AA

> Applies to all baseline components in [`components/`](./components/). Owner: Team D (spec) + Team B (implementation). Sign-off required before a component ships.

This checklist is the gate every baseline component must pass. It maps WCAG 2.1 AA success criteria to concrete, testable items. Each component section lists the items that apply to it; the global section applies to all.

## How to use

1. Implement the component per its spec in `components/<name>.md`.
2. Run the automated checks (axe-core / `tests/design-tokens.test.ts`).
3. Walk the **Manual test steps** for the component below.
4. Fill the **Sign-off** block at the bottom of the component's spec PR.
5. A component is not "done" until every applicable box is checked.

---

## Global checklist (all components)

- [ ] **1.4.3 Contrast (Minimum)** — Text ≥ 4.5:1 against its background; large text (≥ 18px regular / ≥ 14px bold) and UI component boundaries ≥ 3:1. Verified at the token layer by `tests/design-tokens.test.ts`; re-verify if a component introduces a new foreground/background pair.
- [ ] **1.4.1 Use of Color** — Color is never the only means of conveying information. Pair color with text, icon, or shape (e.g. error border + error text + icon).
- [ ] **1.4.11 Non-text Contrast** — UI component borders, focus indicators, and status dots are ≥ 3:1 against adjacent colors.
- [ ] **2.1.1 Keyboard** — All functionality is operable from keyboard with no time traps.
- [ ] **2.1.2 No Keyboard Trap** — Focus can leave any component via keyboard (except modals, which trap intentionally and provide Escape).
- [ ] **2.4.3 Focus Order** — DOM/tab order matches the visual reading order.
- [ ] **2.4.7 Focus Visible** — Every focusable element shows `--focus-ring` on `:focus-visible`. No `outline: none` without a replacement.
- [ ] **2.4.6 Headings and Labels** — Headings and form labels are descriptive.
- [ ] **3.3.2 Labels or Instructions** — Inputs have visible labels (or `aria-label` when a visible label is impossible).
- [ ] **4.1.2 Name, Role, Value** — Every interactive element has an accessible name, correct role (native element where possible), and exposes state (`aria-expanded`, `aria-busy`, `aria-invalid`, `aria-current`, `aria-disabled` as applicable).
- [ ] **4.1.3 Status Messages** — Status changes (validation errors, "saved", "synced") are announced via `role="alert"` or `aria-live` without moving focus.
- [ ] **1.4.10 Reflow** — Content reflows at 320px width and 200% zoom without horizontal scroll or lost content.
- [ ] **2.3.1 Three Flashes** — No content flashes more than 3 times/second. Motion tokens are short and respect `prefers-reduced-motion`.

### Manual test steps (global)

1. **Keyboard-only pass**: unplug the mouse. Complete the component's primary task using Tab/Shift+Tab/Enter/Space/Escape/arrows.
2. **Screen reader pass**: run VoiceOver (mac) or NVDA (win). Confirm the component's name, role, and state are announced correctly on entry and on state change.
3. **Zoom pass**: set browser zoom to 200%; confirm no clipping, no horizontal scroll, no overlap.
4. **Reduced motion**: enable "reduce motion" in OS settings; confirm animations are effectively off and the component is still fully usable.
5. **Dark mode**: toggle `[data-theme="dark"]`; confirm contrast and focus ring remain visible.
6. **axe-core scan**: run axe on a render of the component; zero critical/serious violations.

### Sign-off block (paste into component PR)

```
Accessibility sign-off — <component>
- [ ] Automated: tests/design-tokens.test.ts passes
- [ ] Automated: axe-core scan clean
- [ ] Manual: keyboard-only pass
- [ ] Manual: screen reader pass (VoiceOver/NVDA)
- [ ] Manual: 200% zoom / 320px reflow
- [ ] Manual: reduced-motion pass
- [ ] Manual: dark-mode contrast + focus pass
Reviewer: <name>   Date: <yyyy-mm-dd>
```

---

## Per-component checklist

### Button
- [ ] Native `<button>` (or `<a>` for navigation); never `<div onclick>`.
- [ ] Accessible name present (label text or `aria-label` for icon-only).
- [ ] `:focus-visible` shows `--focus-ring`.
- [ ] `disabled` uses native `disabled` **or** `aria-disabled` + `tabindex="-1"` + click suppression (one strategy, consistent).
- [ ] `loading` sets `aria-busy`, keeps button in tab order, blocks clicks; spinner is `aria-hidden`.
- [ ] Enter and Space activate (native; not prevented).
- [ ] Variant foreground-on-fill ≥ 4.5:1.

### Input
- [ ] Visible `<label>` (or `aria-label` in toolbar cases); `for`/`id` wired.
- [ ] `aria-describedby` wires helper + error text; error text container `role="alert"`.
- [ ] `aria-invalid="true"` when error present.
- [ ] `:focus-visible` shows `--focus-ring`; border switches to `--color-border-focus`.
- [ ] Password toggle button has `aria-label` ("Show password"/"Hide password") + `aria-pressed`; focus stays on button.
- [ ] Required fields use native `required` and show a `*` in `--color-error-dark`.
- [ ] Placeholder is not used as a substitute for a label.

### Card
- [ ] Rendered as `<section>`/`<article>` with an accessible name when it's a region.
- [ ] Title rendered as a heading with correct level.
- [ ] Interactive card uses a stretched `<a>` (or `<button>`), not `onclick` on the `<div>`.
- [ ] Inner links given `position: relative; z-index: 1` so they remain clickable.
- [ ] `:focus-visible` on the card link shows `--focus-ring`.
- [ ] Meaning not conveyed by color alone in body content.

### Avatar
- [ ] Accessible name: image `alt` (defaults to `name`) or wrapper `aria-label`.
- [ ] Decorative avatars (name shown adjacent) use `alt=""` / `aria-hidden`.
- [ ] Status dot is `aria-hidden`; status conveyed via the avatar's accessible name (e.g. "Jane, online") or visible text.
- [ ] Loading: `aria-busy="true"`; no noisy live-region announcement.
- [ ] Avatar lists use `<ul>`/`<li>`.
- [ ] If avatar links to a profile, it's an `<a>` with `--focus-ring` on focus.

### Badge
- [ ] No `role="status"` on static badges; only wrap *updating* status badges in `aria-live="polite"`.
- [ ] Color paired with text (never color-only meaning).
- [ ] Dot is `aria-hidden`; label conveys status.
- [ ] Solid foreground-on-fill ≥ 4.5:1; subtle/outline text-on-bg ≥ 4.5:1.

### Navigation
- [ ] Each `<nav>` has a unique `aria-label` ("Primary", "Breadcrumb", …).
- [ ] Current page uses `aria-current="page"` (not `aria-selected`).
- [ ] No hover-only dropdowns; menus are click-to-open with `aria-expanded`/`aria-controls`.
- [ ] Hamburger/drawer button: `aria-expanded`, `aria-controls`, `aria-label`.
- [ ] Mobile drawer traps focus while open; Escape closes and returns focus to the trigger.
- [ ] Breadcrumb separators are `aria-hidden`; last crumb `aria-current="page"` and is not a link.
- [ ] Skip link is first focusable; target `#main` has `tabindex="-1"`.

### Modal / Dialog
- [ ] `role="dialog"` + `aria-modal="true"`; `aria-labelledby` points to the title.
- [ ] Focus trapped inside while open; first focusable element receives focus on open.
- [ ] On close, focus returns to the trigger element.
- [ ] `Escape` closes (unless `dismissable={false}`).
- [ ] Backdrop click closes (unless `dismissable={false}`); inner clicks don't bubble to backdrop.
- [ ] Body scroll locked while open; no layout shift from scrollbar removal.
- [ ] Close button is `<button aria-label="Close">`, in tab order.
- [ ] Entrance/exit motion respects `prefers-reduced-motion`; still operable with motion off.
- [ ] No nested modals; if unavoidable, lower modal gets `aria-hidden`.

### Layout
- [ ] Exactly one `<main>` per page; has `id="main"` + `tabindex="-1"`.
- [ ] Skip link present, first in DOM, visible on focus, moves focus to `#main`.
- [ ] Semantic landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`); `role` only when overriding.
- [ ] Exactly one `<h1>` in `<main>`; no skipped heading levels.
- [ ] DOM order matches visual order (no CSS `order` reordering of meaningful content).
- [ ] Reflows at 320px / 200% zoom with no horizontal scroll or lost content.
- [ ] Sidebar labeled appropriately ("Primary" if it holds primary nav, else "Secondary").
