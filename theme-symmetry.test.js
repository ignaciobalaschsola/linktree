import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Feature: theme-and-font-update, Property 1: Theme variable set symmetry
 *
 * For any CSS custom property name defined in the dark theme block,
 * that same property name must also be defined in the light theme block,
 * and vice versa. The two sets of variable names must be identical.
 *
 * Validates: Requirements 1.5
 */

/**
 * Extracts the content of a @media (prefers-color-scheme: <scheme>) block
 * from raw CSS text, then returns the set of CSS variable names (--*) defined inside.
 */
function extractVariableNames(css, scheme) {
  // Match the media query block for the given scheme.
  // We need to handle nested braces: @media (...) { :root { ... } }
  const mediaRegex = new RegExp(
    `@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${scheme}\\s*\\)\\s*\\{`,
    'g'
  );

  const match = mediaRegex.exec(css);
  if (!match) return new Set();

  // Walk forward from the opening brace to find the matching closing brace
  let depth = 1;
  let i = match.index + match[0].length;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }

  const blockContent = css.slice(match.index + match[0].length, i - 1);

  // Extract all CSS custom property names (--something) from declarations
  const varNames = new Set();
  const varRegex = /(--[\w-]+)\s*:/g;
  let varMatch;
  while ((varMatch = varRegex.exec(blockContent)) !== null) {
    varNames.add(varMatch[1]);
  }

  return varNames;
}

describe('Property 1: Theme variable set symmetry', () => {
  let darkVars;
  let lightVars;
  let allVars;

  beforeAll(() => {
    const cssPath = resolve(import.meta.dirname, 'style.css');
    const css = readFileSync(cssPath, 'utf-8');

    darkVars = extractVariableNames(css, 'dark');
    lightVars = extractVariableNames(css, 'light');
    allVars = [...new Set([...darkVars, ...lightVars])];
  });

  it('both theme blocks should define at least one variable', () => {
    expect(darkVars.size).toBeGreaterThan(0);
    expect(lightVars.size).toBeGreaterThan(0);
  });

  it('any variable from either theme exists in both themes (property-based)', () => {
    // Precondition: we need variables to test against
    expect(allVars.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: allVars.length - 1 }),
        (index) => {
          const varName = allVars[index];
          // The variable must exist in both dark and light theme blocks
          expect(darkVars.has(varName)).toBe(true);
          expect(lightVars.has(varName)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
