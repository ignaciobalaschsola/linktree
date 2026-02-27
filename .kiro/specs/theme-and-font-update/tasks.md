# Implementation Plan: Theme and Font Update

## Overview

Restructure CSS custom properties into symmetric `prefers-color-scheme` media query blocks, introduce a light theme palette, adapt the particle background and theme-color meta tag via JS, replace all hardcoded colors with CSS variables, and apply the Roboto font to the h1 heading. Each task builds incrementally so the site remains functional after every step.

## Tasks

- [x] 1. Restructure CSS variables and add theme media query blocks
  - [x] 1.1 Move color variables out of bare `:root` into `@media (prefers-color-scheme: dark)` block
    - Extract all color custom properties from the current `:root` selector
    - Create `@media (prefers-color-scheme: dark) { :root { ... } }` block with the existing Klein blue palette values
    - Leave only `--border-radius` and `--transition` in the bare `:root`
    - _Requirements: 1.1, 1.3, 1.4, 2.3_

  - [x] 1.2 Add `@media (prefers-color-scheme: light)` block with light theme palette
    - Create `@media (prefers-color-scheme: light) { :root { ... } }` block
    - Define all light theme color values as specified in the design (`--bg-primary: #f5f7fa`, etc.)
    - Ensure the variable name set is identical to the dark theme block
    - _Requirements: 1.2, 1.5, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.3 Add new CSS variables for JS-consumed particle colors and theme-color
    - Add `--particle-rgb`, `--particle-line-rgb`, and `--theme-color` to both media query blocks
    - Dark: `--particle-rgb: 43, 92, 214`, `--theme-color: #002fa7`
    - Light: `--particle-rgb: 0, 47, 167`, `--theme-color: #f5f7fa`
    - _Requirements: 4.1, 4.2, 7.1, 7.2_

  - [x] 1.4 Write property test for theme variable set symmetry
    - **Property 1: Theme variable set symmetry**
    - Parse both media query blocks from `style.css`, extract variable name sets
    - For any randomly selected variable name from either set, assert it exists in both sets
    - **Validates: Requirements 1.5**

- [x] 2. Replace hardcoded colors with CSS variable references
  - [x] 2.1 Replace hardcoded colors in modal, lightbox, and overlay rules
    - Replace `rgba(5, 7, 14, 0.85)` with `var(--overlay-bg)` in `.modal-overlay`
    - Replace `rgba(5, 7, 14, 0.92)` with `var(--lightbox-bg)` in `.lightbox`
    - Replace `rgba(43, 92, 214, 0.2)` with `var(--modal-border)` in `.modal-card` border
    - Replace `rgba(0, 0, 0, 0.5)` with `var(--modal-shadow)` in `.modal-card` box-shadow
    - Replace `rgba(255, 255, 255, 0.08)` with `var(--lightbox-close-bg)` in `.lightbox-close`
    - Replace `rgba(255, 255, 255, 0.15)` with `var(--lightbox-close-hover)` in `.lightbox-close:hover`
    - Replace `#fff` with `var(--lightbox-close-color)` in `.lightbox-close` color
    - Replace `rgba(255, 255, 255, 0.05)` with `var(--modal-close-hover-bg)` in `.modal-close:hover`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 Replace hardcoded colors in interactive elements and utility components
    - Replace `rgba(43, 92, 214, 0.3)` with `var(--avatar-border)` in `.avatar` border
    - Replace `rgba(43, 92, 214, 0.15)` with `var(--hover-border)` in `.link-btn:hover` border-color
    - Replace `rgba(0, 0, 0, 0.25)` with `var(--section-hover-shadow)` in `.link-section:hover` box-shadow
    - Replace `rgba(43, 92, 214, 0.15)` with `var(--copy-btn-bg)` in `.copy-btn` background
    - Replace `rgba(43, 92, 214, 0.2)` with `var(--copy-btn-border)` in `.copy-btn` border
    - Replace `rgba(0, 47, 167, 0.06)` with `var(--key-row-bg)` in `.modal-key-row` background
    - Replace `rgba(43, 92, 214, 0.15)` with `var(--key-row-border)` in `.modal-key-row` border
    - Replace `rgba(43, 92, 214, 0.3)` with `var(--toast-border)` in `.toast` border
    - Replace `rgba(122, 132, 153, 0.15)` with `var(--wip-badge-bg)` in `.wip-badge` background
    - Replace `rgba(0, 47, 167, 0.35)` with `var(--klein-glow)` in `@keyframes pulse-glow` 50% frame
    - _Requirements: 5.1, 5.3_

  - [x] 2.3 Write property test for text-background contrast sufficiency
    - **Property 2: Text-background contrast sufficiency**
    - For each combination of (theme: dark|light) × (text variable: `--text-primary`, `--text-secondary`, `--text-desc`, `--silver`) × (background variable: `--bg-primary`, `--bg-section`, `--bg-card`), compute WCAG contrast ratio and assert ≥ 4.5
    - **Validates: Requirements 3.3, 5.2**

- [x] 3. Checkpoint - Verify CSS restructuring
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add Roboto font and apply to h1
  - [x] 4.1 Add Roboto to Google Fonts link in `index.html`
    - Update the existing Google Fonts `<link>` to include `family=Roboto:wght@700`
    - Change to: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@700&display=swap`
    - _Requirements: 6.1_

  - [x] 4.2 Apply Roboto font to `.profile h1` in `style.css`
    - Add `font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;` to the `.profile h1` rule
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 4.3 Write property test for font family exclusivity
    - **Property 3: Font family exclusivity**
    - For any text-rendering DOM element, assert its computed `font-family` starts with `Inter` if it is not `.profile h1`, or starts with `Roboto` if it is `.profile h1`
    - **Validates: Requirements 6.2, 6.3**

- [x] 5. Adapt particle background for theme switching in `script.js`
  - [x] 5.1 Add `getParticleColors()` helper function
    - Create function that reads `--particle-rgb` and `--particle-line-rgb` from `getComputedStyle(document.documentElement)`
    - Store RGB triplet strings in module-level variables (`particleRGB`, `lineRGB`)
    - Fall back to `"43, 92, 214"` if the CSS variable value is empty
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Replace hardcoded particle colors with dynamic values
    - Replace `rgba(43, 92, 214, ${p.opacity})` with template literal using `particleRGB`
    - Replace `rgba(43, 92, 214, ${0.04 * ...})` with template literal using `lineRGB`
    - Call `getParticleColors()` during `initParticles()`
    - _Requirements: 4.1, 4.2_

  - [x] 5.3 Add `matchMedia` listener to re-read particle colors on scheme change
    - Listen on `window.matchMedia('(prefers-color-scheme: dark)')` change event
    - On change, call `getParticleColors()` to refresh particle and line RGB values
    - _Requirements: 4.3, 2.4_

- [x] 6. Add theme-color meta tag adaptation in `script.js`
  - [x] 6.1 Implement `updateThemeColor()` function and matchMedia listener
    - Read `--theme-color` from `getComputedStyle(document.documentElement)`
    - Set `meta[name="theme-color"]` content attribute to the read value
    - Guard with null check on `querySelector` result
    - Register on the same `matchMedia` change listener used for particles
    - Call `updateThemeColor()` on page load
    - _Requirements: 7.1, 7.2, 2.4_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The design uses CSS, HTML, and vanilla JavaScript — no build step or framework involved
