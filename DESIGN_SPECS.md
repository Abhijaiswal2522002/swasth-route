# SwasthRoute - Design Specifications

## Design System Overview

SwasthRoute uses a modern healthcare-focused design system with teal/emerald primary colors, glassmorphism effects, and smooth animations.

## Color Palette

### Primary Colors
```
Teal/Emerald (Primary)
- Light: oklch(0.45 0.15 160)
- Dark mode: oklch(0.55 0.12 160)
- Hex: #00876a (approximate)
- Usage: CTAs, primary text, icons, brand elements
```

### Secondary Colors
```
Mint Green (Secondary)
- Light: oklch(0.93 0.04 160)
- Dark mode: oklch(0.28 0.05 160)
- Hex: #e8f5f3 (approximate)
- Usage: Backgrounds, cards, subtle accents
```

### Accent Color
```
Sky Blue (Accent)
- Light: oklch(0.55 0.12 200)
- Dark mode: oklch(0.60 0.10 200)
- Hex: #0088cc (approximate)
- Usage: Secondary CTAs, highlights, energy
```

### Neutral Colors
```
Background:
- Light: oklch(0.99 0 0) - Off-white
- Dark: oklch(0.15 0 0) - Near-black

Foreground:
- Light: oklch(0.22 0 0) - Charcoal
- Dark: oklch(0.95 0 0) - Near-white

Borders:
- Light: oklch(0.94 0 0) - Light gray
- Dark: oklch(0.28 0 0) - Dark gray

Muted:
- Light: oklch(0.56 0 0) - Medium gray
- Dark: oklch(0.71 0 0) - Light gray
```

### Semantic Colors
```
Success: oklch(0.70 0.15 150) - Green
Warning: oklch(0.70 0.15 60) - Yellow
Error: oklch(0.577 0.245 27.325) - Red
Info: oklch(0.60 0.10 200) - Blue
```

## Typography

### Font Stack
```
Headings & Body: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'Geist Mono', 'Courier New', monospace
```

### Text Sizes
```
h1: 3.5rem (56px)  - Hero titles
h2: 2.25rem (36px) - Section titles
h3: 1.875rem (30px) - Card titles
h4: 1.5rem (24px)  - Subheadings
p: 1rem (16px)     - Body text
small: 0.875rem (14px) - Helper text
xs: 0.75rem (12px) - Captions
```

### Line Heights
```
Display/Headlines: 1.2
Headings: 1.3
Body Text: 1.5
Dense Text: 1.4
```

### Font Weights
```
Light: 300
Regular: 400 (body text)
Medium: 500 (labels, badges)
Semibold: 600 (card titles)
Bold: 700 (headings)
```

## Spacing System

Uses 4px base unit with Tailwind's spacing scale:
```
1 = 4px
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
16 = 64px
20 = 80px
24 = 96px
```

## Component Styles

### Buttons
```
Primary Button:
- Background: gradient from-primary to-accent
- Text: text-primary-foreground
- Padding: h-11 (44px height)
- Border-radius: rounded (8px)
- Hover: shadow-lg, brightness increase
- Transition: all duration-300

Secondary Button:
- Border: border-primary/20
- Background: transparent
- Hover: bg-primary/5
- Text: text-primary

Outline Button:
- Border: border-primary/20
- Hover: bg-primary/5, border-primary/40
```

### Cards
```
Standard Card:
- Background: bg-card (with transparency in dark mode)
- Border: border-primary/10
- Padding: p-6 (24px)
- Border-radius: rounded-lg (8px)
- Box-shadow: none (minimal)

Hover States:
- Border: border-primary/30
- Shadow: shadow-lg
- Transform: hover:scale-105
- Transition: duration-300
```

### Input Fields
```
Text Input:
- Background: bg-input/50
- Border: border-primary/20
- Padding: px-4 py-3
- Border-radius: rounded-md
- Placeholder: text-muted-foreground

Focus State:
- Border: border-primary
- Outline: none (handled by border)
- Shadow: ring-primary/20 ring-2

Disabled:
- Opacity: 50%
- Cursor: not-allowed
```

### Form Labels
```
- Font-size: text-sm (14px)
- Font-weight: font-medium (500)
- Color: text-foreground
- Margin-bottom: mb-2
```

### Badges & Tags
```
Status Badge:
- Background: bg-primary/20
- Text: text-primary
- Padding: px-3 py-1
- Border-radius: rounded-full
- Font-size: text-sm
- Font-weight: font-semibold
```

## Layout Patterns

### Hero Section
```
- Max-width: 7xl (80rem)
- Min-height: min-h-screen
- Padding: px-6 py-20
- Grid: md:grid-cols-2 gap-12
- Background: gradient from-primary/10 via-background to-secondary/10
```

### Card Grid
```
Mobile: Single column (100%)
Tablet (md): 2 columns
Desktop (lg): 3 columns
Gap: gap-6 (24px)
```

### Navigation
```
Sticky positioning with backdrop blur
Height: py-4 (16px padding top/bottom)
Border-bottom: border-primary/10
Background: bg-background/80 backdrop-blur-sm
```

## Visual Effects

### Glassmorphism
```
- backdrop-blur-sm or backdrop-blur
- bg-card/60 or bg-card/80 (transparency)
- border-primary/10 or border-primary/20
- Removes harsh shadows, adds softness
```

### Gradients
```
Horizontal:
- from-primary to-accent

Vertical:
- from-primary/10 via-background to-secondary/10

No complex gradients - max 2-3 color stops
```

### Animations
```
Hover Scale:
- hover:scale-105 transform duration-300

Hover Shadow:
- hover:shadow-lg transition-all

Fade In:
- opacity-0 → opacity-100

Spin/Pulse:
- animate-spin (loading indicators)
- animate-pulse (attention grabbers)
```

### Transitions
```
Default: duration-300 ease-in-out
All properties: transition-all
Specific property: transition-colors, transition-transform
```

## Dark Mode

All colors have dark mode variants:
```
Light mode variables:
--primary: oklch(0.45 0.15 160)
--background: oklch(0.99 0 0)

Dark mode variables (.dark):
--primary: oklch(0.55 0.12 160)
--background: oklch(0.15 0 0)
```

## Icon Guidelines

### Icon Library
- Using Lucide React icons
- Size: 16px, 20px, 24px (never arbitrary sizes)
- Stroke-width: 2 (default)
- Color: Inherit from text color or explicit color classes

### Common Icons Used
```
Navigation:
- Home, Settings, LogOut, Menu, X

Actions:
- Search, Plus, Edit, Delete, Share
- Heart (favorites), MapPin (location)

Status:
- Check, AlertCircle, Clock, Phone
- Star (rating), TrendingUp (analytics)
```

## Responsive Design

### Breakpoints
```
Mobile: <640px (sm)
Tablet: 640px-1024px (md)
Desktop: 1024px-1280px (lg)
Wide: 1280px+ (xl)
```

### Responsive Classes
```
Mobile-first approach:
- Text sizes: text-base md:text-lg lg:text-xl
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Padding: px-4 md:px-6 lg:px-8
```

## Accessibility

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: sufficient visual feedback

### Focus States
- Visible focus indicator on all interactive elements
- Color: primary with ring-2 ring-primary/20

### Alt Text
- All images have descriptive alt text
- Decorative images marked as `alt=""` or hidden from SR

### ARIA Labels
- Buttons: descriptive text or aria-label
- Icons: aria-label when not self-explanatory
- Forms: associated labels with inputs

## Spacing Rules

### Padding
```
Cards: p-6 (24px)
Sections: py-20 (80px)
Navigation: py-4 (16px)
Form inputs: px-4 py-3
```

### Margins
- Never mix margins with gap on same element
- Use gap for child spacing
- Use margins for top-level spacing only

### Gap
```
Tight spacing: gap-2, gap-3
Regular spacing: gap-4, gap-6
Loose spacing: gap-8, gap-12
```

## Text Alignment

### Headlines
- Use `text-balance` for better line breaks
- Prevents orphaned words

### Body Text
- Use `text-pretty` for natural wrapping
- Improves readability

## Loading States

### Skeleton Screens
```
- Subtle pulse animation
- Same shape as content
- Light gray background
- Duration: 2 seconds
```

### Loading Spinners
```
- Icon with `animate-spin`
- 24px size
- Primary color
- Center aligned
```

## Error States

### Error Messages
```
Background: bg-destructive/10
Border: border-destructive/20
Text: text-destructive
Padding: p-3 rounded-lg
Icon: AlertCircle
```

### Input Errors
```
Border: border-destructive
Background: bg-destructive/5 (subtle)
Error text below: text-destructive text-sm
```

## Empty States

```
Title: Text that explains what's missing
Icon: Large icon (48px) in muted-foreground
Message: Helpful secondary text
CTA: Clear action to resolve
```

## Mobile Optimization

### Touch Targets
- Minimum 48px × 48px for buttons
- Padding around interactive elements

### Mobile Navigation
```
- Hamburger menu for secondary nav
- Sticky header (top-0 z-40)
- Bottom action buttons for CTAs
```

### Mobile Forms
```
- Full-width inputs
- Large touch-friendly buttons
- Single column layout
- Phone number with country prefix
```

## Breakpoint Usage Examples

### Header
```
Mobile: Single line, stacked
Tablet: Two columns
Desktop: Full navigation bar
```

### Pharmacy Cards
```
Mobile: 1 column (stack vertically)
Tablet: 2 columns
Desktop: 3 columns
```

### Forms
```
Mobile: Full width, single column
Tablet: 2 columns for some fields
Desktop: Multiple columns, optimized layout
```

## Performance Considerations

### CSS
- Tailwind v4 with optimized bundle
- Purges unused classes in production
- No custom CSS unless necessary

### Images
- Use Next.js Image component
- Responsive srcset
- Lazy loading by default

### Animations
- GPU-accelerated (transform, opacity)
- Avoid animating: width, height, position
- Reduced motion: respects prefers-reduced-motion

## Design Tokens

All design values are defined in `app/globals.css`:
```css
:root {
  --primary: oklch(0.45 0.15 160);
  --secondary: oklch(0.93 0.04 160);
  --accent: oklch(0.55 0.12 200);
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.22 0 0);
  --border: oklch(0.94 0 0);
  --input: oklch(0.98 0 0);
  --ring: oklch(0.45 0.15 160);
  --radius: 0.625rem;
}
```

## UI Kit Components

Ready-made components from shadcn/ui:
- Button (all variants)
- Card (with header, content, footer)
- Input (text field)
- Dialog (modals)
- Dropdown Menu
- Avatar
- Badge
- Toast/Alert

All components styled to match SwasthRoute design system.

## Animation Spec

### Page Transitions
- Fade in/out: 300ms
- Easing: ease-in-out

### Component Hover
- Scale: 5% (1.05)
- Shadow increase
- Duration: 300ms

### Loading States
- Spin: infinite 1s rotation
- Pulse: 2s opacity fade

### Success/Error Feedback
- Slide in from top: 300ms
- Auto-dismiss after 5 seconds
- Slide out: 200ms

## Print Styles

- Hide navigation and CTAs
- Optimize for paper (black text on white)
- Adjust spacing for print
- Hide animations and interactions

## Version History

- **v1.0** (Current): Initial design system launch
  - Teal/emerald healthcare color scheme
  - Glassmorphism effects
  - Mobile-first responsive design
  - Dark mode support
  - Comprehensive component library

This design system ensures consistency, accessibility, and a professional appearance throughout the SwasthRoute application.
