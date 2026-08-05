# Typography Tokens

> Part of [ADR-F-D-001](../tokens.md) · Team D owns typography tokens; Team B consumes them.

## Font families

| Token | CSS variable | Stack | Usage |
|-------|--------------|-------|-------|
| Sans | `--font-sans` | system UI stack | All UI and body text |
| Mono | `--font-mono` | system mono stack | Code, IDs, numeric data tables |

```css
body { font-family: var(--font-sans); }
code, pre, kbd { font-family: var(--font-mono); }
```

## Font sizes

| Token | Value | CSS variable | Usage |
|-------|-------|--------------|-------|
| xs | 12px | `--font-size-xs` | Captions, badges, overlines |
| sm | 14px | `--font-size-sm` | Secondary text, helper text, table cells |
| base | 16px | `--font-size-base` | Body text, inputs, buttons (default) |
| lg | 18px | `--font-size-lg` | Card titles, emphasized body |
| xl | 20px | `--font-size-xl` | Section headings (h4) |
| 2xl | 24px | `--font-size-2xl` | Sub-page headings (h3) |
| 3xl | 30px | `--font-size-3xl` | Page headings (h2) |
| 4xl | 36px | `--font-size-4xl` | Hero / page titles (h1) |

## Font weights

| Token | Value | CSS variable | Usage |
|-------|-------|--------------|-------|
| Normal | 400 | `--font-weight-normal` | Body text |
| Medium | 500 | `--font-weight-medium` | Labels, buttons, table headers |
| Semibold | 600 | `--font-weight-semibold` | Card titles, sub-headings |
| Bold | 700 | `--font-weight-bold` | Page headings, strong emphasis |

## Line heights

| Token | Value | CSS variable | Usage |
|-------|-------|--------------|-------|
| Tight | 1.25 | `--line-height-tight` | Headings, single-line UI |
| Normal | 1.5 | `--line-height-normal` | Body text, paragraphs (default) |
| Relaxed | 1.75 | `--line-height-relaxed` | Long-form reading, help docs |

## Usage examples

```css
.h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
.body {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
}
.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
}
```

## Guidance

- **Base size is 16px.** Do not set root font-size below 16px — it harms low-vision users who rely on the browser default.
- **Use rem, not px**, in token values (already done). Components consume tokens, so they inherit user font-scaling automatically.
- **Heading hierarchy**: pair each heading level with a size token; don't skip levels for visual effect.
- **Line height for text blocks** should be `--line-height-normal` (1.5) or `--line-height-relaxed` (1.75) to meet readability baselines.
