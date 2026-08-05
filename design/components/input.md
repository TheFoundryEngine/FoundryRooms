# Input — Component Spec

> Baseline component · [Tokens](../tokens.md) · [Accessibility checklist](../accessibility-checklist.md)

Text-entry controls: single-line `<input>`, multi-line `<textarea>`, and the password variant with a show/hide toggle.

## Anatomy

```
Label *                          ← <label>, required, --font-size-sm medium
┌────────────────────────────┐
│ [leadingIcon] Value  [⋯]   │   ← control; trailing slot for toggle/clear
└────────────────────────────┘
Helper text                     ← --color-text-muted, --font-size-sm
Error text                      ← --color-error-dark, --font-size-sm
```

## Variants

| Variant | Element | Notes |
|---------|---------|-------|
| text | `<input type="text">` | default |
| email | `<input type="email">` | browser validation + `inputmode="email"` |
| password | `<input type="password">` + show/hide button | toggle button is a labelled icon button |
| textarea | `<textarea>` | supports `rows`; auto-grow optional |

## States

| State | Border | Other |
|-------|--------|-------|
| Default | `1px solid var(--color-border)` | `bg var(--color-surface)` |
| Hover | `1px solid var(--color-border-strong)` | |
| Focus | `1px solid var(--color-border-focus)` + `box-shadow: var(--focus-ring)` | `outline: none` (ring replaces it) |
| Error | `1px solid var(--color-error)` | error text shown; `aria-invalid="true"` |
| Disabled | `1px solid var(--color-border)`, `bg var(--color-surface-dark)`, `opacity 0.6`, `cursor not-allowed` | `aria-disabled="true"` |

## Slots

- **Label**: always present. Use a real `<label>` with `for` pointing at the input id (or wrap the input). Required fields show a `*` in `--color-error-dark`.
- **Helper text**: optional guidance, shown below the control. Linked via `aria-describedby`.
- **Error text**: replaces helper text when `error` is set. Linked via `aria-describedby`; `role="alert"` so screen readers announce on change.
- **Leading icon** (optional): 16px, `--color-text-muted`.
- **Trailing slot** (optional): password show/hide, clear button. Must be a labelled `<button type="button">`.

## Props (API)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `'text' \| 'email' \| 'password' \| 'search' \| 'url'` | `'text'` | textarea uses `multiline` |
| `multiline` | `boolean` | `false` | renders `<textarea>` |
| `rows` | `number` | `4` | textarea only |
| `label` | `string` | **required** | |
| `value` / `defaultValue` | `string` | — | controlled or uncontrolled |
| `placeholder` | `string` | — | never replace the label |
| `helperText` | `string` | — | shown when no error |
| `error` | `string` | — | when set, shows error text + `aria-invalid` |
| `required` | `boolean` | `false` | native `required` + `*` |
| `disabled` | `boolean` | `false` | |
| `id` | `string` | auto-generated | required to wire label/aria |
| `showPasswordToggle` | `boolean` | `true` for password | |
| `onChange` | `(value: string) => void` | — | |

## Accessibility

- **Label**: every input has a visible `<label>`. If a visible label is impossible (search in a toolbar), provide `aria-label`.
- **Association**: `label[for]` ↔ `input[id]`, or wrap. Auto-generated ids must be stable across renders.
- `aria-describedby` points to helper **and** error text ids (space-separated). Error text container has `role="alert"` so it's announced when it appears.
- `aria-invalid="true"` when `error` is set.
- `required` uses the native attribute (screen readers honor it).
- **Focus**: `:focus-visible` shows `--focus-ring`; do not rely on the browser default outline alone — it's inconsistent.
- **Password toggle**: button has `aria-label="Show password"` / `"Hide password"` and `aria-pressed`. Focus stays on the button after toggle; the input value is not cleared.
- **Keyboard**: standard text editing; `Tab` moves between fields; the show/hide button is a normal button in tab order.
- **Error announcement**: don't move focus into the field on error — let `role="alert"` announce. Summarize errors at top of long forms with `aria-live="polite"`.

## Token usage summary

```
background      var(--color-surface)
color           var(--color-text)
border          1px solid var(--color-border)        focus → var(--color-border-focus)
border-radius   var(--radius-md)
padding         var(--space-2) var(--space-3)
font-size       var(--font-size-base)
font-weight     var(--font-weight-normal)
line-height     var(--line-height-normal)
label           var(--font-size-sm) var(--font-weight-medium) var(--color-text)
helper          var(--font-size-sm) var(--color-text-muted)
error           var(--font-size-sm) var(--color-error-dark)
focus           box-shadow: var(--focus-ring)
transition      border-color var(--duration-fast) var(--ease-out)
```
