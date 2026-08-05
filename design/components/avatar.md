# Avatar — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

An avatar shows a user's image, with an initials fallback and a loading state. Optionally shows a presence/status dot.

## Anatomy

```
   ┌─────┐
   │ IMG │   ← circular image, object-fit: cover
   │  or │     fallback: initials on a tinted fill
   └─────┘
       ●         ← optional status dot (bottom-right)
```

## Sizes

| Size | Dimension | Font size (initials) | Dot size |
|------|-----------|----------------------|----------|
| sm | 24px | `--font-size-xs` | 8px |
| md | 32px | `--font-size-sm` | 10px |
| lg | 40px | `--font-size-base` | 12px |
| xl | 64px | `--font-size-xl` | 16px |

## Variants

| Variant | Visual | Tokens |
|---------|--------|--------|
| Image | `<img>` fills the circle | `border-radius: var(--radius-full)`, `object-fit: cover` |
| Fallback (initials) | tinted fill + 1–2 initials | `bg --color-secondary-light`, `color --color-secondary-dark` (light) / `--color-secondary` (dark) |
| Fallback (icon) | generic user icon | same fill as initials fallback |

The fallback fill may be derived deterministically from the user id (hash → palette slot) for visual distinction, but **must still meet contrast** for the initials text. Use the secondary family as the safe default.

## States

| State | Visual | Notes |
|-------|--------|-------|
| Loading | shimmer placeholder (`--color-surface-dark` with a subtle pulse) | `aria-busy="true"` on the wrapper; image has `alt=""` until loaded |
| Loaded | image visible | `aria-busy` removed |
| Error | fallback (initials or icon) shown | image `onError` swaps to fallback; no error text exposed to AT |

## Status dot

Optional indicator pinned to bottom-right. Color comes from status tokens:

| Status | Color |
|--------|-------|
| online | `--color-success` |
| away | `--color-warning` |
| busy / do-not-disturb | `--color-error` |
| offline | `--color-text-muted` |

The dot has a 2px ring matching `--color-surface` so it reads against the avatar edge.

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `src` | `string` | — | image URL; if absent or fails, fallback shows |
| `name` | `string` | — | used for initials fallback **and** `alt` text / `aria-label` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` | — | shows status dot |
| `alt` | `string` | derived from `name` | override image alt |
| `fallbackIcon` | `ReactNode` | default user icon | shown when no `name` and no/failed `src` |

## Accessibility

- **Accessible name**: the avatar must have a name. Image uses `alt` (defaults to `name`). Fallback wrapper uses `aria-label={name}`. If `name` is unknown, use `aria-label="User avatar"` (or a more specific role label).
- **Decorative avatars**: if the user's name is already shown adjacent to the avatar, mark the image `alt=""` and the fallback `aria-hidden="true"` to avoid redundant announcements.
- **Status dot**: must not rely on color alone. Pair the dot with an `aria-label` on the avatar like `"Jane Doe, online"`, or provide a visible text status. The dot itself is `aria-hidden` (it's redundant to the label).
- **Loading**: `aria-busy="true"` on the wrapper; do not announce "loading" via live region — it's too noisy.
- **Grouping**: avatar lists (e.g. "members") should be in a `<ul>`; each avatar+name is an `<li>`.
- **Keyboard**: avatars are non-interactive by default. If an avatar links to a profile, wrap it in an `<a>` with an accessible name and show `--focus-ring` on focus.

## Token usage summary

```
size            24/32/40/64px (see Sizes)
border-radius   var(--radius-full)
image           object-fit: cover
fallback bg     var(--color-secondary-light)
fallback color  var(--color-secondary-dark)  (light) / var(--color-secondary) (dark)
dot             var(--color-success|warning|error|text-muted)
dot ring        2px solid var(--color-surface)
loading shimmer var(--color-surface-dark) + opacity pulse
transition      opacity var(--duration-normal) var(--ease-out)
```
