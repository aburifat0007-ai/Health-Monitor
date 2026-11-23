---
name: Premium Wellness Interface
colors:
  surface: '#0e1513'
  surface-dim: '#0e1513'
  surface-bright: '#343b39'
  surface-container-lowest: '#090f0e'
  surface-container-low: '#161d1b'
  surface-container: '#1a211f'
  surface-container-high: '#252b2a'
  surface-container-highest: '#2f3634'
  on-surface: '#dde4e1'
  on-surface-variant: '#bbcac6'
  inverse-surface: '#dde4e1'
  inverse-on-surface: '#2b3230'
  outline: '#859490'
  outline-variant: '#3c4947'
  surface-tint: '#4fdbc8'
  primary: '#4fdbc8'
  on-primary: '#003731'
  primary-container: '#14b8a6'
  on-primary-container: '#00423b'
  inverse-primary: '#006b5f'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb59e'
  on-tertiary: '#5e1800'
  tertiary-container: '#f38764'
  on-tertiary-container: '#6c2106'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71f8e4'
  primary-fixed-dim: '#4fdbc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7c2d11'
  background: '#0e1513'
  on-background: '#dde4e1'
  surface-variant: '#2f3634'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a luxurious wellness interface tailored for a high-end health monitoring mobile application. The brand personality is serene, authoritative, and deeply reassuring, blending clinical precision with the soft, inviting atmosphere of a high-end spa. 

Targeting users who actively manage their holistic wellbeing, the interface evokes a sense of calm control and sophisticated clarity. The visual style relies on refined minimalism paired with soft geometric curves and translucent layered surfaces, ensuring that complex biometric data is presented as a digestible, premium experience rather than sterile clinical readouts.

## Colors

The color palette is built for a dark mode environment, anchored by deep charcoal and obsidian surfaces that reduce eye strain and emphasize glowing biometric indicators.

- **Primary Color (`#14b8a6`):** A luminous neon teal used for primary actions, active states, and key metric highlights.
- **Secondary / Success Accent (`#10b981`):** A vibrant emerald green reserved for positive health trends, optimal biometric ranges, and success states.
- **Background Obsidian (`#0f172a`):** The deepest canvas tone, establishing an immersive, distraction-free environment.
- **Surface Layer (`#1e293b`):** A refined slate tint used for cards, navigation bars, and modular containers.
- **Text Palette:** High-contrast pure white (`#f8fafc`) for headlines, supported by soft neutral gray (`#94a3b8`) for secondary labels and metadata.

## Typography

Typography relies entirely on **Plus Jakarta Sans**, utilizing its geometric softness and open apertures to maintain high legibility across dense metric dashboards and calm wellness narratives alike. 

- **Scale & Hierarchy:** Font sizes are optimized for mobile viewports, ensuring that large data callouts (like heart rate or sleep scores) scale gracefully without breaking bounds. 
- **Tracking:** Headlines feature slightly negative tracking for a tight, modern editorial feel, while small labels utilize positive tracking to maximize readability at microscopic sizes.

## Layout & Spacing

The layout utilizes a flexible fluid grid system calibrated for mobile viewports, prioritizing thumb-friendly zones and generous negative space to reinforce the feeling of luxurious calm.

- **Canvas Margins:** Outer margins are fixed at `1.25rem` to keep content safely inset from device edges.
- **Gutters:** Standardized at `1rem` to separate modular metric cards cleanly.
- **Rhythm:** Spacing tokens scale predictably from `0.25rem` to `2.5rem`, ensuring consistent vertical rhythm between data visualizations, interactive controls, and section headers.

## Elevation & Depth

Depth is articulated through a sophisticated combination of tonal surface layering and ambient, low-opacity neon backlighting. 

- **Tonal Stacking:** The background canvas (`#0f172a`) hosts elevated cards rendered in `#1e293b`. This inherent contrast in surface lightness establishes primary hierarchy without relying on harsh drop shadows.
- **Ambient Glows:** Important interactive cards and critical health alerts feature diffused, low-opacity teal (`#14b8a6`) or emerald (`#10b981`) shadows that simulate a soft internal luminescence, elevating the component above the dark canvas.
- **Ghost Borders:** Subtle, translucent outlines (`rgba(255, 255, 255, 0.08)`) frame interactive boundaries cleanly in dark mode.

## Shapes

The design system enforces a pill-shaped and deeply curved shape language (`roundedness` level 3). 

- **Corner Radii:** Standard UI elements start with a generous `1rem` radius, while major containers and modal sheets adopt `2rem` to `3rem` curves (`rounded-lg`, `rounded-xl`).
- **Tactile Softness:** This high level of roundedness removes clinical harshness, transforming raw data containers into welcoming, tactile wellness objects that feel organic and comfortable to touch.

## Components

All components integrate the core visual tokens to maintain a seamless, high-end ecosystem experience.

- **Buttons:** Fully pill-shaped (`roundedness` 3) with solid neon teal (`#14b8a6`) fills for primary actions, dark slate fills for secondary actions, and subtle ambient glows on active states. Text is rendered in high-contrast white using `label-lg`.
- **Chips & Tags:** Compact, pill-shaped filters and status indicators utilizing translucent background tints with solid accent text for categories like "Recovery", "Sleep", and "Activity".
- **Cards:** Elevated `#1e293b` surfaces featuring generous rounded corners (`2rem+`), subtle ghost borders, and optional ambient backlighting for urgent metrics.
- **Input Fields:** Deeply rounded text inputs and form fields with dark fills, soft inner shadows, and glowing teal focus states.
- **Checkboxes & Radios:** Custom geometric selectors featuring smooth transitions, replacing sharp squares with organic rounded toggles that glow emerald green when checked.
- **Lists & Data Rows:** Clean, uncluttered list items separated by ultra-soft dividers, optimized for scanning biometric histories and daily logs.
- **Biometric Rings & Charts:** Specialized visualization components utilizing gradient strokes of neon teal and emerald green against dark circular tracks to display daily progress effortlessly.