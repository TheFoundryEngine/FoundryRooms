import { describe, it, expect } from 'vitest';
import { cruise } from 'dependency-cruiser';
import config from '../../.dependency-cruiser.js';

/**
 * Architecture boundary tests.
 *
 * These tests run dependency-cruiser against the full codebase and assert
 * that no forbidden dependencies exist. They enforce:
 * - cross-context isolation (no module imports another module's internals)
 * - hexagonal layering (domain → application → adapters, never reversed)
 * - domain framework independence (no NestJS/Drizzle/Express in domain)
 * - contract purity (no adapter or ORM imports in contracts)
 *
 * If a test fails, it means someone added an import that violates the
 * architectural rules in .dependency-cruiser.js. Fix the import, do not
 * weaken the rule.
 */
describe('architecture boundary rules', () => {
  it('should have no violations', async () => {
    const result = await cruise(['src/', 'modules/', 'contracts/'], {
      ...config,
      baseDir: process.cwd(),
    });

    const violations = (result as { output?: { violations?: unknown[] } }).output?.violations ?? [];

    if (violations.length > 0) {
      const details = violations
        .map(
          (v: { rule?: { name?: string }; from: string; to: string }) =>
            `  - [${v.rule?.name ?? 'unknown'}] ${v.from} → ${v.to}`,
        )
        .join('\n');
      throw new Error(
        `Architecture boundary violations detected (${violations.length}):\n${details}\n\nFix the imports above. Do not weaken the rules in .dependency-cruiser.js.`,
      );
    }

    expect(violations).toHaveLength(0);
  });
});
