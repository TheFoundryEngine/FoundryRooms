# Radius & Shadow Tokens

> Part of [ADR-F-D-001](../tokens.md) · Team D owns radius and shadow tokens; Team B consumes them.

## Radius

| Token | Value | CSS variable | Usage |
|-------|-------|--------------|-------|
| None | 0 | `--radius-none` | Full-bleed images, dividers |
| Sm | 4px | `--radius-sm` | Badges, tags, small controls |
| Md | 8px | `--radius-md` | Buttons, inputs (default) |
| Lg | 12px | `--radius-lg` | Cards, popovers |
| Xl | 16px | `--radius-xl` | Modals, large panels |
| Full | 9999px | `--radius-full` | Avatars, pills, circular buttons |

```css
.button { border-radius: var(--radius-md); }
.card { border-radius: var(--radius-lg); }
.avatar { border-radius: var(--radius-full); }
.badge { border-radius: var(--radius-sm); }
```

## Shadow

| Token | CSS variable | Usage |
|-------|--------------|-------|
| None | `--shadow-none` | Flat surfaces, outlined cards |
| Sm | `--shadow-sm` | Raised inputs, hover lift on cards |
| Md | `--shadow-md` | Popovers, dropdowns, sticky headers |
| Lg | `--shadow-lg` | Modals, dialogs, floating panels |

Shadows are redefined under `[data-theme="dark"]` with higher opacity so they read against dark surfaces.

```css
.card--elevated { box-shadow: var(--shadow-md); }
.modal-panel { box-shadow: var(--shadow-lg); }
.dropdown { box-shadow: var(--shadow-md); }
```

## Guidance

- **One radius per component tier**: controls → `md`, containers → `lg`, overlays → `xl`. Mixing within a tier looks inconsistent.
- **Don't combine radius + heavy shadow** on the same element unless it's an overlay — it reads as a floating card, which should be reserved for true overlays.
- **Shadows imply elevation hierarchy.** A page with everything at `--shadow-lg` has no hierarchy; reserve `lg` for the topmost layer (modal).
