import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Feature: theme-and-font-update, Property 2: Text-background contrast sufficiency
 *
 * For each combination of (theme: dark|light) × (text variable: --text-primary,
 * --text-secondary, --text-desc, --silver) × (background variable: --bg-primary,
 * --bg-section, --bg-card), compute WCAG contrast ratio and assert ≥ 4.5.
 *
 * Validates: Requirements 3.3, 5.2
 */

const TEXT_VARS = ['--text-primary', '--text-secondary', '--text-desc', '--silver'];
const BG_VARS = ['--bg-primary', '--bg-section', '--bg-card'];
const THEMES = ['dark', 'light'];

/**
 * Extracts hex color variable values from a prefers-color-scheme media query block.
 * Returns a Map of variable name -> hex color string.
 */
function extractColorValues(css, scheme) {
  const mediaRegex = new RegExp(
    `@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${scheme}\\s*\\)\\s*\\{`,
    'g'
  );

  const match = mediaRegex.exec(css);
  if (!match) return new Map();

  let depth = 1;
  let i = match.index + match[0].length;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }

  const blockContent = css.slice(match.index + match[0].length, i - 1);
  const colors = new Map();
  const varRegex = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;
  let varMatch;
  while ((varMatch = varRegex.exec(blockContent)) !== null) {
    colors.set(varMatch[1], varMatch[2]);
  }
  return colors;
}

/**
 * Parses a hex color string (#RGB, #RRGGBB) into [r, g, b] in 0-255 range.
 */
function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/**
 * Linearizes an sRGB channel value (0-255) to linear RGB (0-1).
 */
function linearize(channel) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Computes WCAG relative luminance from an [r, g, b] array (0-255).
 */
function relativeLuminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Computes WCAG contrast ratio between two colors (each as [r, g, b] 0-255).
 * Returns a value >= 1.
 */
function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Property 2: Text-background contrast sufficiency', () => {
  let themeColors; // { dark: Map, light: Map }

  beforeAll(() => {
    const cssPath = resolve(import.meta.dirname, 'style.css');
    const css = readFileSync(cssPath, 'utf-8');
    themeColors = {
      dark: extractColorValues(css, 'dark'),
      light: extractColorValues(css, 'light'),
    };
  });

  it('should have all required text and background variables in both themes', () => {
    for (const theme of THEMES) {
      for (const v of [...TEXT_VARS, ...BG_VARS]) {
        expect(themeColors[theme].has(v), `${theme} theme missing ${v}`).toBe(true);
      }
    }
  });

  it('every (theme, text, background) combination has contrast ratio ≥ 4.5 (property-based)', () => {
    // Build the full combination space
    const combinations = [];
    for (const theme of THEMES) {
      for (const textVar of TEXT_VARS) {
        for (const bgVar of BG_VARS) {
          combinations.push({ theme, textVar, bgVar });
        }
      }
    }

    expect(combinations.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: combinations.length - 1 }),
        (index) => {
          const { theme, textVar, bgVar } = combinations[index];
          const textHex = themeColors[theme].get(textVar);
          const bgHex = themeColors[theme].get(bgVar);

          const textRgb = parseHex(textHex);
          const bgRgb = parseHex(bgHex);
          const ratio = contrastRatio(textRgb, bgRgb);

          expect(
            ratio,
            `${theme} theme: ${textVar} (${textHex}) on ${bgVar} (${bgHex}) has contrast ${ratio.toFixed(2)}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
