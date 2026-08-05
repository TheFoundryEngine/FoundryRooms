import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, '..', 'apps', 'frontend');

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    let st;
    try {
      st = statSync(fullPath);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      results.push(...walkDir(fullPath, ext));
    } else if (entry.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function readVueFiles(subdir: string): { path: string; content: string }[] {
  const base = join(FRONTEND_ROOT, subdir);
  return walkDir(base, '.vue').map((path) => ({
    path,
    content: readFileSync(path, 'utf-8'),
  }));
}

describe('frontend architecture boundaries (ADR-007)', () => {
  describe('no raw fetch in components or pages', () => {
    const forbidden = /\$fetch\(|[^a-zA-Z0-9_$]fetch\(/;

    for (const subdir of ['components', 'pages']) {
      it(`${subdir}/**/*.vue contains no raw fetch() or $fetch()`, () => {
        const files = readVueFiles(subdir);
        expect(files.length).toBeGreaterThan(0);
        const offenders = files.filter((f) => forbidden.test(f.content));
        if (offenders.length) {
          throw new Error(
            `Raw fetch detected in ${subdir} (only services/api may use $fetch):\n` +
              offenders.map((o) => `  - ${o.path}`).join('\n'),
          );
        }
      });
    }
  });

  describe('contract types are imported, not redefined', () => {
    // Known contract type names that must be imported from /contracts/,
    // never redeclared inside a component or page.
    const contractTypeNames = [
      'LoginRequest',
      'LoginResponse',
      'RegisterRequest',
      'RegisterResponse',
      'LogoutResponse',
      'PasswordResetRequest',
      'PasswordResetResponse',
      'PasswordResetConfirmRequest',
      'PasswordResetConfirmResponse',
      'ActorSummary',
      'ActorBase',
      'User',
      'UserSummary',
      'Session',
      'SessionToken',
      'Community',
      'CommunitySummary',
      'Membership',
    ];

    const redeclarePattern = new RegExp(
      `export\\s+(interface|type)\\s+(${contractTypeNames.join('|')})\\b`,
    );

    for (const subdir of ['components', 'pages']) {
      it(`${subdir}/**/*.vue does not redefine contract types`, () => {
        const files = readVueFiles(subdir);
        const offenders = files.filter((f) => redeclarePattern.test(f.content));
        if (offenders.length) {
          throw new Error(
            `Contract type redefined in ${subdir} (import from /contracts/ instead):\n` +
              offenders.map((o) => `  - ${o.path}`).join('\n'),
          );
        }
      });
    }
  });

  describe('services/api imports contract types from /contracts/', () => {
    it('services/api/**/*.ts references the shared contracts package', () => {
      const files = walkDir(join(FRONTEND_ROOT, 'services', 'api'), '.ts');
      expect(files.length).toBeGreaterThan(0);
      // At least one service file must import from the shared contracts.
      const referencingContracts = files.some((path) =>
        readFileSync(path, 'utf-8').includes('contracts/'),
      );
      expect(referencingContracts).toBe(true);
    });
  });
});
