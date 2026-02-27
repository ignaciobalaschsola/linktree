import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Feature: theme-and-font-update, Property 3: Font family exclusivity
 *
 * For any text-rendering DOM element, assert its computed font-family starts
 * with Inter if it is not .profile h1, or starts with Roboto if it is .profile h1.
 *
 * Implementation: Static CSS analysis — parse style.css to verify:
 * 1. .profile h1 has font-family starting with 'Roboto'
 * 2. body has font-family starting with 'Inter'
 * 3. No other rule sets font-family starting with Roboto
 * 4. Randomly selected selectors inherit Inter (not Roboto)
 *
 * Validates: Requirements 6.2, 6.3
 */

/**
 * Parses CSS text and extracts all rule blocks with their selectors and
 * font-family declarations. Skips @media contents by recursing into them.
 * Returns an array of { selector: string, fontFamily: string }.
 */
function extractFontFamilyRules(css) {
  const results = [];

  // Remove CSS comments
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // We need to walk through the CSS and extract selector + font-family pairs.
  // Handle nested @media blocks by recursing into their content.
  parseCssBlock(cleaned, results);

  return results;
}

/**
 * Recursively parses CSS text to find all rules with font-family declarations.
 */
function parseCssBlock(text, results) {
  let i = 0;
  while (i < text.length) {
    // Skip whitespace
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) break;

    // Check for @-rules
    if (text[i] === '@') {
      const atRuleStart = i;
      // Read until opening brace
      while (i < text.length && text[i] !== '{') i++;
      if (i >= text.length) break;

      const atRuleHeader = text.slice(atRuleStart, i).trim();
      i++; // skip '{'

      // Find matching closing brace
      let depth = 1;
      const blockStart = i;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        i++;
      }
      const blockContent = text.slice(blockStart, i - 1);

      // For @keyframes, skip entirely (not relevant to font-family)
      if (atRuleHeader.startsWith('@keyframes')) continue;

      // For @media and other at-rules, recurse into the block
      parseCssBlock(blockContent, results);
      continue;
    }

    // Regular rule: read selector until '{'
    const selectorStart = i;
    while (i < text.length && text[i] !== '{') i++;
    if (i >= text.length) break;

    const selector = text.slice(selectorStart, i).trim();
    i++; // skip '{'

    // Find matching closing brace (no nesting expected in regular rules)
    let depth = 1;
    const declStart = i;
    while (i < text.length && depth > 0) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      i++;
    }
    const declarations = text.slice(declStart, i - 1);

    // Check for font-family declaration
    const fontMatch = declarations.match(/font-family\s*:\s*([^;]+)/i);
    if (fontMatch) {
      results.push({
        selector: selector,
        fontFamily: fontMatch[1].trim(),
      });
    }
  }
}

/**
 * Returns true if the font-family value starts with the given font name.
 */
function fontFamilyStartsWith(fontFamilyValue, fontName) {
  // Normalize: remove quotes and check the first font in the stack
  const normalized = fontFamilyValue.replace(/['"]/g, '').trim();
  return normalized.startsWith(fontName);
}

describe('Property 3: Font family exclusivity', () => {
  let fontRules;
  let allSelectors;

  beforeAll(() => {
    const cssPath = resolve(import.meta.dirname, 'style.css');
    const css = readFileSync(cssPath, 'utf-8');
    fontRules = extractFontFamilyRules(css);
    allSelectors = fontRules.map((r) => r.selector);
  });

  it('should find font-family declarations in the CSS', () => {
    expect(fontRules.length).toBeGreaterThan(0);
  });

  it('.profile h1 font-family starts with Roboto', () => {
    const profileH1Rules = fontRules.filter((r) =>
      r.selector.includes('.profile h1')
    );
    expect(profileH1Rules.length).toBeGreaterThan(0);

    for (const rule of profileH1Rules) {
      expect(
        fontFamilyStartsWith(rule.fontFamily, 'Roboto'),
        `.profile h1 font-family should start with Roboto, got: ${rule.fontFamily}`
      ).toBe(true);
    }
  });

  it('body font-family starts with Inter', () => {
    const bodyRules = fontRules.filter((r) => r.selector === 'body');
    expect(bodyRules.length).toBeGreaterThan(0);

    for (const rule of bodyRules) {
      expect(
        fontFamilyStartsWith(rule.fontFamily, 'Inter'),
        `body font-family should start with Inter, got: ${rule.fontFamily}`
      ).toBe(true);
    }
  });

  it('for any randomly selected CSS rule with font-family, it starts with Inter unless it is .profile h1 (property-based)', () => {
    expect(fontRules.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: fontRules.length - 1 }),
        (index) => {
          const rule = fontRules[index];
          const isProfileH1 = rule.selector.includes('.profile h1');

          if (isProfileH1) {
            expect(
              fontFamilyStartsWith(rule.fontFamily, 'Roboto'),
              `${rule.selector} should start with Roboto, got: ${rule.fontFamily}`
            ).toBe(true);
          } else {
            // All non-.profile-h1 rules with font-family should NOT start with Roboto
            // They should start with Inter (or be monospace for code elements, which is acceptable)
            expect(
              fontFamilyStartsWith(rule.fontFamily, 'Roboto'),
              `${rule.selector} should NOT start with Roboto, got: ${rule.fontFamily}`
            ).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
