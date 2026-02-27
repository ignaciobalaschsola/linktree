# Requirements Document

## Introduction

This feature adds automatic light/dark theme support and a distinct heading font to a personal linktree-style website. The site currently uses a fixed dark (Klein blue) color scheme defined via CSS custom properties in `:root`. The update will introduce a centralized theme system where color variables are defined exclusively within `prefers-color-scheme` media queries — both dark and light themes are equal peers, with no default-plus-override pattern. Non-color structural variables (e.g., border-radius, transition) remain in `:root`. Additionally, the h1 element displaying the owner's name will use a different, tasteful font (Roboto) while all other text remains in Inter.

## Glossary

- **Site**: The static HTML/CSS/JS personal links page consisting of `index.html`, `style.css`, and `script.js`
- **Theme_System**: The CSS mechanism that defines color variables exclusively within `prefers-color-scheme` media queries, treating both themes as equal peers
- **Light_Theme**: The set of CSS custom property values defined within the `prefers-color-scheme: light` media query
- **Dark_Theme**: The set of CSS custom property values defined within the `prefers-color-scheme: dark` media query
- **Centralized_Variables**: The `:root` block containing only non-color structural variables (e.g., `--border-radius`, `--transition`) shared by both themes
- **Heading_Font**: The font family applied exclusively to the h1 name element
- **Particle_Background**: The canvas-based animated particle effect rendered by `script.js`

## Requirements

### Requirement 1: Centralized Theme Architecture

**User Story:** As a developer, I want color variables defined per theme inside their respective media queries with no default-plus-override pattern, so that the theme system is clean, symmetric, and easy to maintain.

#### Acceptance Criteria

1. THE Theme_System SHALL define color custom properties for the Dark_Theme exclusively within a `@media (prefers-color-scheme: dark)` block targeting `:root`
2. THE Theme_System SHALL define color custom properties for the Light_Theme exclusively within a `@media (prefers-color-scheme: light)` block targeting `:root`
3. THE Centralized_Variables block in `:root` SHALL contain only non-color structural variables shared across both themes (e.g., `--border-radius`, `--transition`)
4. THE Theme_System SHALL NOT define any color custom properties in the bare `:root` selector outside of a `prefers-color-scheme` media query
5. THE Dark_Theme and Light_Theme media query blocks SHALL each define the complete set of color variables so that neither theme depends on the other for fallback values

### Requirement 2: Automatic Theme Switching

**User Story:** As a visitor, I want the site to match my browser's color scheme preference, so that the page feels native to my system settings.

#### Acceptance Criteria

1. WHEN the browser reports `prefers-color-scheme: light`, THE Theme_System SHALL apply the Light_Theme color variables to the page
2. WHEN the browser reports `prefers-color-scheme: dark`, THE Theme_System SHALL apply the Dark_Theme color variables to the page
3. THE Dark_Theme SHALL preserve the current color values from the existing site (Klein blue palette)
4. WHEN the browser color scheme preference changes while the page is open, THE Theme_System SHALL update the applied theme without requiring a page reload

### Requirement 3: Light Theme Color Palette

**User Story:** As a visitor in light mode, I want the site to display a clean white/light color scheme, so that the page is comfortable to read in bright environments.

#### Acceptance Criteria

1. WHILE the Light_Theme is active, THE Site SHALL use a white or near-white value for `--bg-primary`
2. WHILE the Light_Theme is active, THE Site SHALL use light gray or white values for `--bg-section`, `--bg-card`, and `--bg-hover`
3. WHILE the Light_Theme is active, THE Site SHALL use dark text colors for `--text-primary`, `--text-secondary`, and `--text-desc` to maintain readable contrast against light backgrounds
4. WHILE the Light_Theme is active, THE Site SHALL retain Klein blue accent colors (`--klein`, `--klein-light`) for brand consistency
5. WHILE the Light_Theme is active, THE Site SHALL use border and glow values appropriate for light backgrounds (visible but not harsh)

### Requirement 4: Particle Background Theme Adaptation

**User Story:** As a visitor, I want the particle background animation to look appropriate in both light and dark modes, so that the visual effect complements the active theme.

#### Acceptance Criteria

1. WHEN the Light_Theme is active, THE Particle_Background SHALL render particles and connection lines using colors that are visible against a light background
2. WHEN the Dark_Theme is active, THE Particle_Background SHALL render particles and connection lines using the current Klein blue color values
3. WHEN the browser color scheme preference changes, THE Particle_Background SHALL update particle colors to match the new theme

### Requirement 5: Modal and Overlay Theme Adaptation

**User Story:** As a visitor, I want modals and overlays to match the active theme, so that the visual experience is consistent across all UI elements.

#### Acceptance Criteria

1. WHILE the Light_Theme is active, THE Site SHALL render the modal card background, lightbox overlay, and toast notifications using Light_Theme-appropriate colors
2. WHILE the Light_Theme is active, THE Site SHALL maintain readable text contrast within modals and overlays
3. WHILE the Dark_Theme is active, THE Site SHALL render modals and overlays using the existing dark color values

### Requirement 6: Heading Font Change

**User Story:** As the site owner, I want my name displayed in a distinct, tasteful font, so that it stands out from the rest of the page content.

#### Acceptance Criteria

1. THE Site SHALL load the Roboto font family from Google Fonts
2. THE Site SHALL apply the Roboto font family exclusively to the h1 element containing the owner's name
3. THE Site SHALL continue to use the Inter font family for all other text elements on the page
4. THE Heading_Font SHALL include appropriate fallback fonts (system sans-serif stack)

### Requirement 7: Theme-Color Meta Tag Adaptation

**User Story:** As a visitor, I want the browser chrome to match the site's active theme, so that the experience feels cohesive on mobile devices.

#### Acceptance Criteria

1. WHEN the Light_Theme is active, THE Site SHALL set the `theme-color` meta tag to a light value appropriate for the Light_Theme
2. WHEN the Dark_Theme is active, THE Site SHALL set the `theme-color` meta tag to the existing Klein blue value (`#002fa7`)
