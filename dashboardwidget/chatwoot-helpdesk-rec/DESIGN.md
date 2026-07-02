---
name: Obsidian Flux
colors:
  surface: '#0f141a'
  surface-dim: '#0f141a'
  surface-bright: '#353941'
  surface-container-lowest: '#0a0e15'
  surface-container-low: '#181c22'
  surface-container: '#1c2027'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2ec'
  on-surface-variant: '#c0c7d5'
  inverse-surface: '#dfe2ec'
  inverse-on-surface: '#2c3138'
  outline: '#8a919f'
  outline-variant: '#404753'
  surface-tint: '#a3c9ff'
  primary: '#a3c9ff'
  on-primary: '#00315d'
  primary-container: '#1493ff'
  on-primary-container: '#002a51'
  inverse-primary: '#0060ab'
  secondary: '#ffdf9e'
  on-secondary: '#3f2e00'
  secondary-container: '#fabd00'
  on-secondary-container: '#6a4e00'
  tertiary: '#ffb689'
  on-tertiary: '#512300'
  tertiary-container: '#e56f03'
  on-tertiary-container: '#471e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d3e3ff'
  primary-fixed-dim: '#a3c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb689'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743500'
  background: '#0f141a'
  on-background: '#dfe2ec'
  surface-variant: '#31353c'
typography:
  display-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 64px
  list-panel-width: 320px
  context-panel-width: 360px
  gutter: 1rem
  padding-xs: 0.25rem
  padding-sm: 0.5rem
  padding-md: 1rem
---

## Brand & Style

This design system embodies a **Corporate / Modern** aesthetic with a heavy emphasis on productivity and high-density information management. The personality is focused, professional, and efficient, designed for long-duration usage in helpdesk or CRM environments.

The visual language leverages a deep charcoal "Dark Mode First" approach to reduce eye strain, punctuated by high-vibrancy accent colors to denote different communication channels and internal states. It utilizes a structured, multi-pane layout that prioritizes quick navigation and clear context switching. The emotional response is one of reliability and control amidst complex data flows.

## Colors

The palette is anchored in a sophisticated black-to-charcoal spectrum. 

- **Primary (Blue):** Used for external customer communications and primary action buttons.
- **Secondary (Amber):** Specifically reserved for internal "Private Notes" to ensure a stark visual distinction from customer-facing messages.
- **Backgrounds:** The interface uses three levels of depth—`#0A0B0D` for the global sidebar, `#15171A` for the primary work surface, and `#1C1E22` for hover states and active list items.
- **Borders:** Subtle `#26292E` borders define the multi-pane layout without introducing visual noise.

## Typography

The system utilizes **Hanken Grotesk** for structural headings to provide a sharp, contemporary feel, while **Inter** handles the heavy lifting for body content and labels due to its exceptional legibility at small sizes.

Typography is treated with a strict hierarchy to manage information density. Secondary text uses a lower opacity or a muted grey to ensure that primary message content remains the focal point. Technical metadata (timestamps, channel names) uses the `label-xs` style to remain present but unobtrusive.

## Layout & Spacing

The design system follows a **Fixed Multi-Pane** layout model, optimized for wide-screen desktop workflows.

1.  **Global Navigation:** A slim, 64px vertical rail on the far left for core application switching.
2.  **Navigation Panel:** A 240px wide sidebar for filtering (Inboxes, Teams, Labels).
3.  **List Panel:** A 320px scrollable feed of active conversations.
4.  **Workspace:** A fluid central area for the chat interface that expands/contracts based on the visibility of the Context Panel.
5.  **Context Panel:** A 360px right-hand sidebar for CRM data and metadata.

Spacing is compact (`padding-sm`) to allow for maximum data visibility without feeling cramped. Use consistent 1px borders to separate these zones.

## Elevation & Depth

This system avoids traditional box-shadows in favor of **Tonal Layering**. Depth is communicated through color value shifts:

- **Level 0 (Base):** The darkest layer used for the global navigation rail.
- **Level 1 (Surface):** The main background for the list and chat panels.
- **Level 2 (Raised):** Used for input fields, dropdowns, and search bars, often paired with a subtle 1px border.
- **Overlays:** Modals and tooltips use a more pronounced `#1C1E22` background with a subtle ambient shadow (0px 4px 20px rgba(0,0,0,0.5)) to separate from the workspace.

## Shapes

The design system employs a **Soft** shape language. Most functional elements like buttons, input fields, and cards use a 0.25rem (4px) radius to maintain a professional, slightly rigid structure. 

Chat bubbles are the exception, utilizing a larger 0.75rem (12px) radius on three corners to provide a friendlier, distinct look that separates conversational content from the surrounding UI frame.

## Components

### Buttons
- **Primary:** Solid blue (`#0091FF`) with white text.
- **Ghost:** Transparent background with `#9096A2` icons; transitions to a subtle grey background on hover.
- **Success:** Solid green (`#22C55E`) for terminal actions like "Resolve."

### Chat Bubbles
- **Customer:** Dark grey background with white text, aligned left.
- **Agent:** Primary blue background with white text, aligned right.
- **Private Note:** Amber background with dark text, spanning the full width of the chat container to indicate an internal state.

### Chips / Badges
Small, low-contrast capsules used for labeling. They should use a semi-transparent version of their category color (e.g., 20% opacity) with a high-contrast text label for readability.

### Input Fields
Search bars and message composers use the Surface-tier background with a persistent 1px border. The focus state is indicated by a primary blue border glow.