/**
 * Drizzle schema coverage guard (THE-72 / #33)
 *
 * deploy.yml runs `drizzle-kit push`, which reconciles the live database
 * against the schema files declared in drizzle.config.ts. A table that
 * exists in the database but is absent from the declared schema is a
 * deletion candidate. These tests fail the build before that can happen:
 *
 * 1. The config must cover the canonical schema location for EVERY module
 *    directory, so a module gaining tables is covered before it ships them.
 * 2. Every file under modules/ that defines tables (calls pgTable) must be
 *    covered, so schemas in non-canonical locations cannot slip past.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import drizzleConfig from '../drizzle.config';

const repoRoot = join(__dirname, '..');
const modulesDir = join(repoRoot, 'modules');

const configPatterns: string[] = Array.isArray(drizzleConfig.schema)
  ? drizzleConfig.schema
  : drizzleConfig.schema
    ? [drizzleConfig.schema]
    : [];

/**
 * Convert one of the config's path globs to a regex. Supports the segment
 * wildcards drizzle-kit resolves (`*` within a segment, `**` across
 * segments). Throws on glob syntax this converter does not model, so an
 * exotic pattern fails the suite loudly instead of passing vacuously.
 */
function globToRegex(pattern: string): RegExp {
  const normalized = pattern.replace(/^\.\//, '');
  if (/[[\]{}!+@(|)]/.test(normalized)) {
    throw new Error(
      `drizzle.config.ts schema pattern "${pattern}" uses glob syntax this ` +
        'test does not model - extend globToRegex in tests/schema-coverage.test.ts',
    );
  }
  const segments = normalized.split('/').map((segment) => {
    if (segment === '**') return '(?:[^/]+/)*[^/]+';
    return segment.replace(/[.\\^$()|]/g, '\\$&').replace(/\*/g, '[^/]*');
  });
  return new RegExp(`^${segments.join('/')}$`);
}

const regexes = configPatterns.map(globToRegex);

function isCovered(repoRelativePath: string): boolean {
  const posixPath = repoRelativePath.split(sep).join('/');
  return regexes.some((regex) => regex.test(posixPath));
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe('drizzle schema coverage', () => {
  it('declares at least one schema pattern', () => {
    expect(configPatterns.length).toBeGreaterThan(0);
  });

  it('covers the canonical schema path of every module directory', () => {
    const moduleNames = readdirSync(modulesDir).filter((name) =>
      statSync(join(modulesDir, name)).isDirectory(),
    );
    expect(moduleNames.length).toBeGreaterThan(0);

    const uncovered = moduleNames.filter(
      (name) =>
        !isCovered(`modules/${name}/adapters/outbound/drizzle/schema.ts`),
    );
    expect(
      uncovered,
      `drizzle.config.ts does not cover the canonical schema path of: ` +
        `${uncovered.join(', ')}. When one of these modules ships tables, ` +
        'drizzle-kit push will treat them as unknown and propose dropping them.',
    ).toEqual([]);
  });

  it('covers every file under modules/ that defines drizzle tables', () => {
    const tableFiles = walk(modulesDir)
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .filter((file) => /\bpgTable\s*\(/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(repoRoot, file));
    expect(tableFiles.length).toBeGreaterThan(0);

    const uncovered = tableFiles.filter((file) => !isCovered(file));
    expect(
      uncovered,
      `These files define tables but are not covered by drizzle.config.ts, ` +
        `so drizzle-kit push does not know about them: ${uncovered.join(', ')}`,
    ).toEqual([]);
  });
});
