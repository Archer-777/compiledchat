---
name: awesome-design-md
description: Reference plain-text design system tokens (colors, typography, spacing) to generate pixel-accurate, consistent UI styles matching specific design systems.
---

# Awesome Design MD Skill

This skill guides the AI to use plain-text design system tokens (`DESIGN.md` rules) to build consistent, production-ready interfaces.

## Core Directives

1. **Always Read DESIGN.md First**: Before generating any component or stylesheet, locate and read `DESIGN.md` in the project root to find color palettes, typography scales, spacing rules, and visual style guides.
2. **Strict Token Adherence**: Never use arbitrary hex values or padding/margin values. Always map to design tokens (e.g., `--primary-color`, `theme.colors.primary`, spacing units like `8dp`, `16dp`).
3. **Responsive Spacing**: Follow standard multi-device spacing scales (4px, 8px, 12px, 16px, 24px, 32px, 48px).
4. **Consistency**: Ensure all components align to the visual language of Vercel, Stripe, or the custom brand language defined in `DESIGN.md`.
