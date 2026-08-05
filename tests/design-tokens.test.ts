import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Design tokens verification (ADR-F-D-001).
 *
 * Asserts:
 *  - tokens.css exists and defines every expected CSS custom property.
 *  - All token documentation and component spec files exist.
 *  - Light- and dark-theme color pairs meet WCAG 2.1 AA contrast
 *    (>= 4.5:1 for text, >= 3:1 for UI boundaries).
 *
 * If this test fails, fix the token value or the missing file. Do not weaken
 * the thresholds — they encode WCAG 2.1 AA.
 */

const ROOT = path.resolve(__dirname, '..');
const DESIGN = path.join(ROOT, 'design');
const TOKENS_CSS = path.join(DESIGN, 'tokens.css');

/* --------------------------------------------------------------------------
 * File existence
 * ------------------------------------------------------------------------ */

const EXPECTED_FILES = [
  'design/tokens.css',
  'design/tokens.md',
  'design/tokens/color.md',
  'design/tokens/spacing.md',
  'design/tokens/typography.md',
  'design/tokens/motion.md',
  'design/tokens/radius.md',
  'design/accessibility-checklist.md',
  'design/components/button.md',
  'design/components/input.md',
  'design/components/card.md',
  'design/components/avatar.md',
  'design/components/badge.md',
  'design/components/navigation.md',
  'design/components/modal.md',
  'design/components/layout.md',
];

describe('design files exist', () => {
  for (const rel of EXPECTED_FILES) {
    it(`${rel} exists`, () => {
      expect(existsSync(path.join(ROOT, rel))).toBe(true);
    });
  }
});

/* --------------------------------------------------------------------------
 * CSS custom properties present
 * ------------------------------------------------------------------------ */

const css = readFileSync(TOKENS_CSS, 'utf8');

const EXPECTED_VARS = [
  // color (light + dark share names)
  '--color-primary',
  '--color-primary-dark',
  '--color-primary-light',
  '--color-primary-foreground',
  '--color-secondary',
  '--color-secondary-dark',
  '--color-secondary-light',
  '--color-secondary-foreground',
  '--color-surface',
  '--color-surface-dark',
  '--color-surface-foreground',
  '--color-background',
  '--color-background-foreground',
  '--color-text',
  '--color-text-muted',
  '--color-text-inverse',
  '--color-border',
  '--color-border-strong',
  '--color-border-focus',
  '--color-success',
  '--color-success-dark',
  '--color-success-light',
  '--color-success-foreground',
  '--color-warning',
  '--color-warning-dark',
  '--color-warning-light',
  '--color-warning-foreground',
  '--color-error',
  '--color-error-dark',
  '--color-error-light',
  '--color-error-foreground',
  '--color-info',
  '--color-info-dark',
  '--color-info-light',
  '--color-info-foreground',
  '--color-focus-ring',
  '--color-focus-ring-offset',
  // spacing
  '--space-0',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-6',
  '--space-8',
  '--space-12',
  '--space-16',
  // typography
  '--font-sans',
  '--font-mono',
  '--font-size-xs',
  '--font-size-sm',
  '--font-size-base',
  '--font-size-lg',
  '--font-size-xl',
  '--font-size-2xl',
  '--font-size-3xl',
  '--font-size-4xl',
  '--font-weight-normal',
  '--font-weight-medium',
  '--font-weight-semibold',
  '--font-weight-bold',
  '--line-height-tight',
  '--line-height-normal',
  '--line-height-relaxed',
  // motion
  '--duration-fast',
  '--duration-normal',
  '--duration-slow',
  '--ease-in',
  '--ease-out',
  '--ease-in-out',
  '--ease-spring',
  // radius
  '--radius-none',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-full',
  // shadow
  '--shadow-none',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  // focus ring composite
  '--focus-ring',
];

describe('tokens.css defines expected custom properties', () => {
  for (const v of EXPECTED_VARS) {
    it(`defines ${v}`, () => {
      // matches "--name:" as a declaration (not inside a comment-only line)
      const re = new RegExp(`(^|\\s)${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`);
      expect(re.test(css)).toBe(true);
    });
  }

  it('defines a dark theme via [data-theme="dark"]', () => {
    expect(css).toMatch(/\[data-theme=['"]dark['"]\]\s*\{/);
  });

  it('respects prefers-reduced-motion', () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

/* --------------------------------------------------------------------------
 * Color contrast (WCAG 2.1 AA)
 * ------------------------------------------------------------------------ */

/** Parse a CSS file into per-theme color maps. */
function parseColorVars(cssText: string): { light: Record<string, string>; dark: Record<string, string> } {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  // Strip comments before parsing so they don't interfere with selector detection.
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match top-level blocks. :root blocks (no nesting here) and [data-theme='dark'].
  // We scan block by block using a simple brace counter.
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    // find the selector text before the brace
    const selector = css.slice(i, open).trim();
    // find matching close brace
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    i = j;

    const isDark = /\[data-theme=['"]dark['"]\]/.test(selector);
    const isRoot = /:root/.test(selector);
    if (!isRoot && !isDark) continue;

    const target = isDark ? dark : light;
    const declRe = /(--color-[a-z-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
    let m: RegExpExecArray | null;
    while ((m = declRe.exec(body)) !== null) {
      target[m[1]!] = expandHex(m[2]!.toLowerCase());
    }
  }
  return { light, dark };
}

/** Expand #abc -> #aabbcc. */
function expandHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]!}${hex[1]!}${hex[2]!}${hex[2]!}${hex[3]!}${hex[3]!}`;
  }
  return hex;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.1 contrast ratio. */
function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const { light, dark } = parseColorVars(css);

/**
 * Pairs to verify. Each entry: [foregroundVar, backgroundVar, minRatio].
 * minRatio is 4.5 for text, 3.0 for UI boundaries / large text.
 *
 * Light and dark have separate lists because the subtle-fill text token
 * differs per theme (light uses the `-dark` text variant on a light fill;
 * dark uses the base status color on a dark fill). Subtle-fill pairs are
 * only asserted for the light theme where the pairing is unambiguous.
 */
const SHARED_PAIRS: Array<[string, string, number]> = [
  // text on page background
  ['--color-text', '--color-background', 4.5],
  ['--color-text-muted', '--color-background', 4.5],
  ['--color-background-foreground', '--color-background', 4.5],
  // text on surface (cards)
  ['--color-surface-foreground', '--color-surface', 4.5],
  ['--color-text', '--color-surface', 4.5],
  ['--color-text-muted', '--color-surface', 4.5],
  // primary as text/link on background
  ['--color-primary', '--color-background', 4.5],
  ['--color-primary-dark', '--color-background', 4.5],
  // solid fills: foreground on fill
  ['--color-primary-foreground', '--color-primary', 4.5],
  ['--color-secondary-foreground', '--color-secondary', 4.5],
  ['--color-success-foreground', '--color-success', 4.5],
  ['--color-warning-foreground', '--color-warning', 4.5],
  ['--color-error-foreground', '--color-error', 4.5],
  ['--color-info-foreground', '--color-info', 4.5],
  // status text (darker variants) on background — helper/error text
  ['--color-success-dark', '--color-background', 4.5],
  ['--color-warning-dark', '--color-background', 4.5],
  ['--color-error-dark', '--color-background', 4.5],
  ['--color-info-dark', '--color-background', 4.5],
  // UI boundary: focus ring on background (3:1)
  ['--color-focus-ring', '--color-background', 3.0],
];

// Subtle-fill pairs (light only): dark text variant on the light fill.
const LIGHT_SUBTLE_PAIRS: Array<[string, string, number]> = [
  ['--color-primary-dark', '--color-primary-light', 4.5],
  ['--color-success-dark', '--color-success-light', 4.5],
  ['--color-warning-dark', '--color-warning-light', 4.5],
  ['--color-error-dark', '--color-error-light', 4.5],
  ['--color-info-dark', '--color-info-light', 4.5],
];

describe('WCAG 2.1 AA color contrast', () => {
  it('parsed color tokens from both themes', () => {
    expect(Object.keys(light).length).toBeGreaterThan(10);
    expect(Object.keys(dark).length).toBeGreaterThan(10);
  });

  const fmt = (r: number) => r.toFixed(2);

  for (const [fg, bg, min] of SHARED_PAIRS) {
    it(`light: ${fg} on ${bg} >= ${min}`, () => {
      expect(light[fg], `missing light token ${fg}`).toBeDefined();
      expect(light[bg], `missing light token ${bg}`).toBeDefined();
      const ratio = contrast(light[fg]!, light[bg]!);
      expect(ratio, `contrast ${fg} on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(min);
    });
    it(`dark: ${fg} on ${bg} >= ${min}`, () => {
      expect(dark[fg], `missing dark token ${fg}`).toBeDefined();
      expect(dark[bg], `missing dark token ${bg}`).toBeDefined();
      const ratio = contrast(dark[fg]!, dark[bg]!);
      expect(ratio, `contrast ${fg} on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(min);
    });
  }

  for (const [fg, bg, min] of LIGHT_SUBTLE_PAIRS) {
    it(`light subtle: ${fg} on ${bg} >= ${min}`, () => {
      expect(light[fg], `missing light token ${fg}`).toBeDefined();
      expect(light[bg], `missing light token ${bg}`).toBeDefined();
      const ratio = contrast(light[fg]!, light[bg]!);
      expect(ratio, `contrast ${fg} on ${bg} = ${fmt(ratio)}`).toBeGreaterThanOrEqual(min);
    });
  }
});
