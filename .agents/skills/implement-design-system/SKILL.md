---
name: implement-design-system
description: Guides the implementation, extension, and auditing of TrueLabel's Evidence-First Clarity CSS design system, design tokens, and accessible UI components. Use when creating or modifying UI components, layout structures, styling, or global CSS.
---

# Implement Design System Skill

## 1. Purpose
Establishes the standard workflow for implementing and styling TrueLabel UI components using the "Evidence-first clarity" design system. Ensures adherence to design tokens, mobile-first responsive patterns, strict accessibility (WCAG 2.2 AA), and the non-misleading visual presentation of evidence.

## 2. When to Use
- Building new UI components or modifying existing component styling.
- Implementing responsive layouts, container structures, or mobile navigation.
- Styling verdict cards, evidence panels, or reference card checklists.
- Auditing CSS custom properties or integrating design system tokens with Tailwind CSS.

## 3. Prerequisites
- Familiarity with `design-system/` CSS architecture (`tokens.css`, `typography.css`, `layout.css`, `components.css`, `forms.css`, `feedback.css`, `utilities.css`, `global.css`).
- Understanding of the 4 PRD v3.1 verdict states and their visual representation constraints.

## 4. Required Context
- TrueLabel's visual direction: Restrained charcoal, slate, and stone neutrals.
- Prohibited visual treatments: No gradients, no glassmorphism, no neon colors, no fake verification seals or glowing green checkmarks.
- Touch target rule: Minimum 44px x 44px for all interactive targets.

## 5. Step-by-Step Workflow
1. **Inspect Existing Styles**: Check `design-system/` before writing any new CSS rules to prevent duplicate definitions.
2. **Identify Tokens**: Map design requirements to existing CSS custom properties (colors, typography, 4px spacing scale, radius, elevation).
3. **Draft Semantic HTML**: Structure the component with appropriate semantic elements (`<main>`, `<article>`, `<section>`, `<button>`, `<fieldset>`).
4. **Apply Component Classes**: Utilize classes from `components.css`, `forms.css`, or `feedback.css`.
5. **Ensure Mobile-First Responsiveness**: Define default styles for mobile viewports (320px-480px), enhancing for tablet (640px+) and desktop (1024px+).
6. **Implement Keyboard Focus States**: Ensure all interactive elements declare `:focus-visible` with a distinct 2px outline.
7. **Verify Reduced Motion**: Confirm all animations and transitions are disabled under `@media (prefers-reduced-motion: reduce)`.

## 6. Decision Points
- *Should this new style be a token or a component class?* If it represents a reusable visual property (color, space, size, radius), declare it as a token in `tokens.css`. If it defines component structure, place it in `components.css`.
- *Can this button use an accent color?* Primary brand actions use deep slate (`--color-brand-primary`). Semantic colors are reserved strictly for feedback and verdict states.

## 7. Safety Checks
- Verify contrast ratios using a WCAG 2.2 AA checker (minimum 4.5:1 for body copy).
- Confirm that verdict presentation never relies solely on color to communicate state.
- Ensure the copied-number caveat is visibly rendered on `Registered and matches` views.

## 8. Testing Requirements
- Visual inspection on small mobile viewports (375px width).
- Keyboard-only navigation test (Tab, Shift+Tab, Enter, Space).
- Screen-reader announcement check with VoiceOver, NVDA, or automated axe-core.

## 9. Expected Deliverables
- Clean, token-driven CSS or React/TSX component code.
- Zero arbitrary pixel values or external network font imports.
- Updated component inventory in `docs/design/COMPONENT_INVENTORY.md` if a new component is introduced.

## 10. Definition of Done
- Component renders correctly across mobile, tablet, and desktop viewports.
- Passes WCAG 2.2 AA automated and manual focus audits.
- Conforms strictly to the "Evidence-first clarity" design direction.

## 11. Common Mistakes to Avoid
- Introducing bright blue, green, or purple brand colors.
- Using skeuomorphic badges or green checkmarks that imply physical product authentication.
- Bypassing the 4px spacing scale with arbitrary margins or paddings.
